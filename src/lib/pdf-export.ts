import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { type HealthRecord, type Visit } from './health-records-db';

export interface PDFExportOptions {
  includeVisits?: boolean;
  includeEmergencyInfo?: boolean;
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

class PDFExportService {
  /**
   * Export a single health record to PDF
   */
  async exportHealthRecord(
    record: HealthRecord, 
    visits: Visit[] = [], 
    options: PDFExportOptions = {}
  ): Promise<void> {
    const {
      includeVisits = true,
      includeEmergencyInfo = true,
      format = 'A4',
      orientation = 'portrait'
    } = options;

    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    // Set up fonts and colors
    const primaryColor = '#4A9B8E';
    const secondaryColor = '#2D3748';
    const textColor = '#4A5568';

    // Header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Vaidyāna Health Records', 20, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Digital Health Record System', 20, 25);

    // Patient Information Section
    let yPosition = 45;
    doc.setTextColor(secondaryColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 20, yPosition);
    
    yPosition += 10;
    doc.setDrawColor(primaryColor);
    doc.line(20, yPosition, 190, yPosition);
    
    yPosition += 10;
    doc.setTextColor(textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

         // Basic Info
     const basicInfo = [
       ['Patient Name:', record.patientName],
       ['Age:', `${record.age} years`],
       ['Gender:', record.gender.charAt(0).toUpperCase() + record.gender.slice(1)],
       ['Blood Group:', record.bloodGroup || 'Not specified'],
       ['Patient ID:', record.patientId],
       ['Last Updated:', record.lastUpdated.toLocaleDateString()]
     ];

     // Add address if available
     if (record.address) {
       const addressParts = [];
       if (record.address.street) addressParts.push(record.address.street);
       if (record.address.city && record.address.state) {
         addressParts.push(`${record.address.city}, ${record.address.state}`);
       } else if (record.address.city) {
         addressParts.push(record.address.city);
       } else if (record.address.state) {
         addressParts.push(record.address.state);
       }
       if (record.address.postalCode) addressParts.push(record.address.postalCode);
       if (record.address.country && record.address.country !== 'India') {
         addressParts.push(record.address.country);
       }
       
       if (addressParts.length > 0) {
         basicInfo.push(['Address:', addressParts.join(', ')]);
       }
     }

    basicInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPosition);
      yPosition += 6;
    });

    // Allergies Section
    yPosition += 5;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryColor);
    doc.text('Allergies', 20, yPosition);
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    
    if (record.allergies.length > 0) {
      record.allergies.forEach((allergy, index) => {
        doc.setFillColor(255, 235, 235);
        doc.rect(20, yPosition - 3, 6, 6, 'F');
        doc.setTextColor(220, 38, 38);
        doc.text('⚠', 22, yPosition);
        doc.setTextColor(textColor);
        doc.text(allergy, 30, yPosition);
        yPosition += 6;
      });
    } else {
      doc.text('No known allergies', 20, yPosition);
      yPosition += 6;
    }

    // Current Medications Section
    yPosition += 5;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryColor);
    doc.text('Current Medications', 20, yPosition);
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    
    if (record.medications.length > 0) {
      record.medications.forEach((medication, index) => {
        doc.setFillColor(240, 248, 255);
        doc.rect(20, yPosition - 3, 6, 6, 'F');
        doc.setTextColor(59, 130, 246);
        doc.text('💊', 22, yPosition);
        doc.setTextColor(textColor);
        doc.text(medication, 30, yPosition);
        yPosition += 6;
      });
    } else {
      doc.text('No current medications', 20, yPosition);
      yPosition += 6;
    }

    // Medical History Section
    if (record.medicalHistory.length > 0) {
      yPosition += 5;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(secondaryColor);
      doc.text('Medical History', 20, yPosition);
      
      yPosition += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      
      record.medicalHistory.forEach((history, index) => {
        doc.text(`• ${history}`, 20, yPosition);
        yPosition += 6;
      });
    }

    // Emergency Information Section
    if (includeEmergencyInfo) {
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('Emergency Contact Information', 20, yPosition);
      
      yPosition += 8;
      doc.setFillColor(254, 242, 242);
      doc.rect(20, yPosition - 5, 170, 25, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      
      const emergencyInfo = [
        ['Name:', record.emergencyContact.name],
        ['Phone:', record.emergencyContact.phone],
        ['Relation:', record.emergencyContact.relation]
      ];
      
      emergencyInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 25, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 60, yPosition);
        yPosition += 6;
      });
    }

    // Visits Section
    if (includeVisits && visits.length > 0) {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(secondaryColor);
      doc.text('Medical Visits', 20, yPosition);
      
      yPosition += 8;
      doc.setDrawColor(primaryColor);
      doc.line(20, yPosition, 190, yPosition);

      visits.forEach((visit, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        yPosition += 5;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(secondaryColor);
        doc.text(`Visit ${index + 1} - ${new Date(visit.date).toLocaleDateString()}`, 20, yPosition);
        
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColor);
        
        // Diagnosis
        doc.setFont('helvetica', 'bold');
        doc.text('Diagnosis:', 20, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(visit.diagnosis, 50, yPosition);
        yPosition += 6;
        
        // Symptoms
        if (visit.symptoms.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('Symptoms:', 20, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(visit.symptoms.join(', '), 50, yPosition);
          yPosition += 6;
        }
        
        // Prescription
        if (visit.prescription.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('Prescription:', 20, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(visit.prescription.join(', '), 50, yPosition);
          yPosition += 6;
        }
        
        // Doctor Notes
        if (visit.doctorNotes) {
          doc.setFont('helvetica', 'bold');
          doc.text('Doctor Notes:', 20, yPosition);
          doc.setFont('helvetica', 'normal');
          const notes = doc.splitTextToSize(visit.doctorNotes, 150);
          doc.text(notes, 20, yPosition + 6);
          yPosition += 6 + (notes.length * 6);
        }
        
        // Vitals
        if (visit.vitals) {
          doc.setFont('helvetica', 'bold');
          doc.text('Vitals:', 20, yPosition);
          doc.setFont('helvetica', 'normal');
          const vitalsText = Object.entries(visit.vitals)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          if (vitalsText) {
            doc.text(vitalsText, 50, yPosition);
            yPosition += 6;
          }
        }
        
        yPosition += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 5;
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated by Vaidyāna Health Records System - Page ${i} of ${pageCount}`,
        20,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        20,
        doc.internal.pageSize.getHeight() - 5
      );
    }

    // Save the PDF
    const fileName = `Health_Record_${record.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  /**
   * Export multiple health records to a single PDF
   */
  async exportMultipleRecords(
    records: HealthRecord[], 
    visitsMap: Map<string, Visit[]> = new Map(),
    options: PDFExportOptions = {}
  ): Promise<void> {
    const {
      includeVisits = true,
      includeEmergencyInfo = true,
      format = 'A4',
      orientation = 'portrait'
    } = options;

    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    // Title page
    doc.setFillColor('#4A9B8E');
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Vaidyāna Health Records', 20, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Multiple Patient Records Export', 20, 30);

    doc.setTextColor('#2D3748');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Records: ${records.length}`, 20, 60);
    doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 70);

    // Add each record
    for (let i = 0; i < records.length; i++) {
      if (i > 0) {
        doc.addPage();
      }
      
      const record = records[i];
      const visits = visitsMap.get(record.patientId) || [];
      
      // Create a temporary element to render the record
      await this.exportHealthRecord(record, visits, {
        ...options,
        includeVisits,
        includeEmergencyInfo
      });
    }

    const fileName = `Health_Records_Bulk_Export_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}

export const pdfExportService = new PDFExportService();
