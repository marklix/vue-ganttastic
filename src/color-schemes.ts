export type ColorScheme = {
  primary: string,
  secondary: string,
  ternary: string,
  quartenary: string,
  hoverHighlight: string,
  text: string,
  background: string,
  toast?: string
}

export const colorSchemes: Record<string, ColorScheme> = {
  default: {
    primary: "#f9fafd",
    secondary: "#edf2f9",
    ternary: "#f9fafd",
    quartenary: "#edf2f9",
    hoverHighlight: "rgba(204, 216, 219, 0.5)",
    text: "#404040",
    background: "white"
  },

  dark: {
    primary: "#0b2f51",
    secondary: "#0b1727",
    ternary: "#0b2f51",
    quartenary: "#08233c",
    hoverHighlight: "rgba(8, 35, 60, 0.5)",
    text: "white",
    background: "#0b1727",
    toast: "#1f1f1f"
  }

}

export default colorSchemes
