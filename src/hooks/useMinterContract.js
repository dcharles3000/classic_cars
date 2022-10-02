import { useContract } from "./useContract";
import ClassicCarsAbi from "../contracts/ClassicCars.json";
import ClassicCarsContractAddress from "../contracts/ClassicCars-address.json";

export const useMinterContract = () =>
  useContract(ClassicCarsAbi.abi, ClassicCarsContractAddress.ClassicCars);
  