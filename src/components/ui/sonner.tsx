import * as React from "react"

type ToasterProps = React.ComponentProps<"div">

const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(
  ({ ...props }, ref) => {
    return <div ref={ref} {...props} />
  }
)
Toaster.displayName = "Toaster"

export { Toaster }