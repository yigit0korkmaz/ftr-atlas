import { candidateBundle } from "../../data/candidate-bank";
import { createEditorialRepository } from "../../editorial/repository";
export const editorialRepository = createEditorialRepository(candidateBundle);
