import Tesseract from 'tesseract.js';
import aiClient from './ai-client';
import dbManager from './database-schema';

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  blocks: OCRBlock[];
}

export interface OCRBlock {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await Tesseract.createWorker();
      await this.worker.loadLanguage('eng+hin+tam');
      await this.worker.initialize('eng+hin+tam');
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,()-/mg',
      });
      this.isInitialized = true;
      console.log('✅ OCR service initialized');
    } catch (error) {
      console.error('Failed to initialize OCR service:', error);
      throw new Error('OCR initialization failed');
    }
  }

  async recognizeText(imageFile: File, language: string = 'en'): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not available');
    }

    try {
      const result = await this.worker.recognize(imageFile);
      
      const blocks: OCRBlock[] = result.data.words.map((word: any) => ({
        text: word.text,
        confidence: word.confidence,
        bbox: {
          x0: word.bbox.x0,
          y0: word.bbox.y0,
          x1: word.bbox.x1,
          y1: word.bbox.y1
        }
      }));

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        language: language,
        blocks: blocks
      };
    } catch (error) {
      console.error('OCR recognition failed:', error);
      throw new Error('Failed to recognize text from image');
    }
  }

  async analyzePrescription(imageFile: File, language: string = 'en'): Promise<any> {
    try {
      // Perform OCR
      const ocrResult = await this.recognizeText(imageFile, language);
      
      // Analyze the extracted text with AI
      const analysis = await aiClient.analyzePrescription(ocrResult.text, language);
      
      // Save to database
      await dbManager.addPrescriptionRecord({
        timestamp: new Date().toISOString(),
        prescription_text: ocrResult.text,
        medicines: JSON.stringify(analysis.medicines),
        doctor_name: analysis.doctor_name,
        date: analysis.date,
        confidence: analysis.confidence,
        language: language,
        image_path: URL.createObjectURL(imageFile)
      });

      // Save AI session
      await dbManager.addAISession({
        timestamp: new Date().toISOString(),
        session_type: 'prescription',
        user_input: ocrResult.text,
        ai_response: JSON.stringify(analysis),
        confidence: analysis.confidence,
        language: language,
        offline_mode: !aiClient.getConnectivityStatus()
      });

      return {
        ocr: ocrResult,
        analysis: analysis
      };
    } catch (error) {
      console.error('Prescription analysis failed:', error);
      throw error;
    }
  }

  async preprocessImage(imageFile: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;

        // Apply preprocessing filters
        ctx?.drawImage(img, 0, 0);
        
        // Convert to grayscale and enhance contrast
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            // Convert to grayscale
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            
            // Enhance contrast
            const enhanced = Math.max(0, Math.min(255, (gray - 128) * 1.5 + 128));
            
            data[i] = enhanced;     // Red
            data[i + 1] = enhanced; // Green
            data[i + 2] = enhanced; // Blue
            // Alpha channel remains unchanged
          }
          ctx.putImageData(imageData, 0, 0);
        }

        // Convert back to file
        canvas.toBlob((blob) => {
          if (blob) {
            const processedFile = new File([blob], imageFile.name, {
              type: 'image/png'
            });
            resolve(processedFile);
          } else {
            resolve(imageFile);
          }
        }, 'image/png');
      };

      img.src = URL.createObjectURL(imageFile);
    });
  }

  async validateImage(imageFile: File): Promise<{ isValid: boolean; error?: string }> {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (imageFile.size > maxSize) {
      return {
        isValid: false,
        error: 'Image file is too large. Please use an image smaller than 10MB.'
      };
    }

    if (!allowedTypes.includes(imageFile.type)) {
      return {
        isValid: false,
        error: 'Unsupported image format. Please use JPEG, PNG, or WebP.'
      };
    }

    return { isValid: true };
  }

  extractMedicineInfo(text: string): any {
    const medicines = [];
    const lines = text.split('\n').filter(line => line.trim());

    // Common medicine patterns
    const medicinePatterns = [
      /(\w+)\s+(\d+mg?)\s*(?:tablet|tab|cap|capsule)?/gi,
      /(\w+)\s+(\d+)\s*(?:mg|mcg|g)\s*(?:tablet|tab|cap|capsule)?/gi,
      /(\w+)\s+(\d+)\s*(?:mg|mcg|g)/gi
    ];

    for (const line of lines) {
      for (const pattern of medicinePatterns) {
        const matches = line.match(pattern);
        if (matches) {
          medicines.push({
            name: matches[1],
            dosage: matches[2],
            frequency: this.extractFrequency(line),
            duration: this.extractDuration(line),
            instructions: this.extractInstructions(line)
          });
          break;
        }
      }
    }

    return medicines;
  }

  private extractFrequency(text: string): string {
    const frequencyPatterns = [
      /(\d+)\s*(?:times?|दिन|முறை)\s*(?:daily|per day|दिन में|நாள்)/gi,
      /(once|twice|thrice)\s*(?:daily|per day)/gi,
      /(\d+)\s*(?:hour|hr)s?/gi
    ];

    for (const pattern of frequencyPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return 'As directed';
  }

  private extractDuration(text: string): string {
    const durationPatterns = [
      /(\d+)\s*(?:days?|दिन|நாட்கள்)/gi,
      /(\d+)\s*(?:weeks?|सप्ताह|வாரங்கள்)/gi,
      /(\d+)\s*(?:months?|महीने|மாதங்கள்)/gi
    ];

    for (const pattern of durationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return 'Until finished';
  }

  private extractInstructions(text: string): string {
    const instructionPatterns = [
      /(?:take|use|apply)\s+(?:with|after|before)\s+(?:food|meals?|breakfast|lunch|dinner)/gi,
      /(?:empty stomach|before food|after food)/gi,
      /(?:with water|with milk)/gi
    ];

    for (const pattern of instructionPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return 'As directed by doctor';
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

export const ocrService = new OCRService();
export default ocrService; 