const generateMfaCode = (digits = 2) => {
  const min = 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  return Math.floor(min + Math.random() * (max - min)).toString();
};

module.exports = {
  generateMfaCode,
};
