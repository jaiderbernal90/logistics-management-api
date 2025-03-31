import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

const generateHash = async (passwordPlain: string): Promise<string> => {
  return await bcrypt.hash(passwordPlain, saltOrRounds);
};

const compareHash = async (plain: string, hash: string): Promise<any> => {
  return await bcrypt.compare(plain, hash);
};

export { generateHash, compareHash };
