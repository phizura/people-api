export const phoneNumberFormater = (number) => {
    let formatted = number.replace(/\D/g, "");
  
    if (formatted.startsWith("0")) formatted = "62" + formatted.substr(1);
  
    return formatted;
  };