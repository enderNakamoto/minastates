import { 
    Field,
    Poseidon,
    PublicKey,
    MerkleMap,
    MerkleTree,
 } from 'o1js';

// Constants for the simulation
const emptyMerkleMap = new MerkleMap();
const emptyMerkleTree12 = new MerkleTree(12);
const emptyPublicKey = PublicKey.empty();

export namespace Const {

    // empty values
    export const EMPTY_MAP_ROOT = emptyMerkleMap.getRoot();
    export const EMPTY_TREE_ROOT12 = emptyMerkleTree12.getRoot();
    export const EMPTY_FIELD = Field(0);
    export const EMPTY_KEY = Poseidon.hash(emptyPublicKey.toFields());
  
    // filled values
    export const FILLED = Field(1);

    // initial derivative values of a nation 
    export const INIT_OUTPUT = Field(1);
    export const INIT_POPULATION = Field(100000);
    export const INIT_GDP = Field(10000000);
    export const INIT_HNI = Field(10); // Happiness National Index
    export const INIT_MILITARY_STRENGTH = Field(10);
    
    // initial base values of a nation
    export const INIT_FREEDOM = Field(50);
    export const INIT_TAX = Field(10);
    export const INIT_WEALTHGAP = Field(1);
    export const INIT_CRIME = Field(1);
    export const INIT_WELFARE = Field(10);
    export const INIT_DEATH_RATE = Field(10);
    export const INIT_BIRTH_RATE = Field(10);
    export const INIT_CIVIL_RIGHTS_INDEX = Field(10);
    export const INIT_MILITARY_PERSONNEL = Field(1);
    export const INIT_MILITARY_BUDGET = Field(2);
    export const INIT_INCLUSITIVITY_INDEX = Field(1);
    export const INIT_EDUCATION_BUDGET = Field(2);
    export const INIT_MANUFACTURING_INDEX = Field(10);
    export const INIT_ENVIRONMENT_INDEX = Field(10);

}