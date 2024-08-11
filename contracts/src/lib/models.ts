import { Struct, Field, Provable, CircuitString, state } from 'o1js';


export class IssueStatement extends Struct({
    statement: CircuitString,
    choiceStatements: Provable.Array(CircuitString, 3),
}){};

/**
 * The consequence of an choice, in the issue
 * effect - the effect of the choice, positive or negative
 * value - the delta value of the effect
 */
export class ChoiceConsequence extends Struct({
    effect: Provable.Array(Field, 10),
    value: Provable.Array(Field, 10)
}){}

/**
 * The consequence of an issue
 * choiceConsequences - the consequences of the choices
 */
export class IssueConsequence extends Struct({
    "0": ChoiceConsequence,
    "1": ChoiceConsequence,
    "2": ChoiceConsequence,
}){}

/**
 * An issue in the game
 * statement - the statement of the issue
 * consequence - the consequences of the issue choices
 */
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