import {
    Field,
    SmartContract,
    state,
    State,
    method,
    PublicKey,
    MerkleMapWitness,
    MerkleWitness,
    Poseidon,
    Provable,
  } from 'o1js';


export class SimulatorZkApp extends SmartContract {

    @state(Field) simulationInitialized = State<Field>();
    @state(Field) numberOfIssues = State<Field>();
    @state(Field) numberOfNations = State<Field>();
    @state(Field) numberOfRevealedIssues = State<Field>();
    @state(Field) playerNullifierRoot = State<Field>();
    @state(Field) nationTreeRoot = State<Field>();
    @state(Field) issueTreeRoot = State<Field>();

    /**
    * Simulation Events
    */
    events = {
        'Simulation Created': Field,
        'Issue Created': Field,
        'Issue Revealed': Field,
        'Nation State Computed': Field,
        'Choices Made': Field,
    };

   /**
   * Constructor
   */
    init() {
        super.init();
    }

    
    @method createNation(
    ) {

    }

    @method createIssue(
    ) {

    }

    @method revealIssue(
    ) {

    }

    @method makeChoice(
    ) {

    }

    @method computeNationState(
    ) {

    }


}