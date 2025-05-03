import bcryptjs from "bcryptjs";

async function hash(password) {
  const rounds = getNumberOfRounds();

  return await bcryptjs.hash(addPepper(password), rounds);
}

function addPepper(password) {
  const pepper = process.env.PEPPER || "Ch1l1_P3p3r";
  return password + pepper;
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(providedPassword, storedPassword) {
  return await bcryptjs.compare(addPepper(providedPassword), storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
