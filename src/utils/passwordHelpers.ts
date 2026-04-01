import argon2 from "argon2";

export const hashPassword = (password: string) => {
  return argon2.hash(password);
};

export const comparePassword = (plain: string, hash: string) => {
  return argon2.verify(hash, plain);
};
