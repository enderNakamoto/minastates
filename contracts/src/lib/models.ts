import { Struct, Field, Provable, CircuitString } from 'o1js';

export class SimulationState extends Struct({
    
}) {


};

export class Choice extends Struct({
    id: Field,
    choiceHash: Field,
    outcomeBits: Field,
  }){
    totalCost(){
        return Field(1);
    };
  };

export class Issue extends Struct({
    id: Field,
    issueHash: Field,
    choices: Provable.Array(Choice, 3),
  }){
    totalCost(){
        return Field(1);
    };
  };

 export class Nation extends Struct({
    name: CircuitString,
    population: Field,
    gdp: Field,
    militaryStrength: Field,
    PoliticalFreedom: Field,
    PersonalFreedom: Field,
    EconomicFreedom: Field,
    researchOutput: Field,
    industrialOutput: Field,
    taxRate: Field,
    deathRate: Field,
    birthRate: Field,
    militaryPersonnel: Field,
    welfareBudget: Field,
    militaryBudget: Field,
    educationBudget: Field,
    wealthGapIndex: Field,
    crimeIndex: Field,
    happinessNationalIndex: Field,
    inclusitivityIndex: Field,
    civilRightsIndex: Field,
    manufacturingIndex: Field,
    environmentIndex: Field,
  }){
    totalCost(){
        return Field(1);
    };
  } 