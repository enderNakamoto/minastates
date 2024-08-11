import { Struct, Field, Provable, CircuitString, state } from 'o1js';

export class Choice extends Struct({
    issueId: Field,
    choiceId: Field,
}){}

export class IssueStatement extends Struct({
    statement: CircuitString,
    choiceStatements: Provable.Array(CircuitString, 3),
}){};

export class IssueConsequence extends Struct({
    effect: Provable.Array(Field, 10),
    value: Provable.Array(Field, 10)
}){}

export class Issue extends Struct({
    statement: IssueStatement,
    consequence: IssueConsequence,
}){}

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
  }){}; 