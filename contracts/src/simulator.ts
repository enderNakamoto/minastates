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
    CircuitString,
    Experimental
  } from 'o1js';
  
import { Const } from './lib/consts';
import { Error } from './lib/errors';
import { Nation, Issue } from './lib/models';

/**
 *  Off-chain state setup
*/
const { OffchainState, OffchainStateCommitments } = Experimental;
const offchainState = OffchainState({
    nations: OffchainState.Map(PublicKey, Nation),
});
class StateProof extends offchainState.Proof {}


/**
 * ZKAPP for the simulator
 * 
 */

export class SimulatorZkApp extends SmartContract {

   /**
   * State variables. on-chain game state (max 8 fields)
   */
    @state(Field) numberOfNations = State<Field>(); // The number of nations in the simulation
    @state(Field) numberOfIssues = State<Field>(); // The number of issues in the simulation
    @state(Field) numberOfRevealedIssues = State<Field>(); // The number of issues revealed in the simulation, by the simulation master
    @state(PublicKey) simulationMaster = State<PublicKey>(); // The player who created the simulation
    @state(Field) playerNullifierRoot = State<Field>(); // MerkleMap <playerAddress -> NationDetailsHash>

    /** 
     * Off-chain states
     */

    // this state is used to store the off-chain state commitments internally
    @state(OffchainStateCommitments) offchainState = State(OffchainStateCommitments.empty());

   /**
   * Constructor
   */
    init() {
        super.init();
        this.numberOfIssues.set(Const.EMPTY_FIELD);
        this.numberOfRevealedIssues.set(Const.EMPTY_FIELD);
        this.numberOfNations.set(Const.EMPTY_FIELD);
        this.simulationMaster.set(PublicKey.empty());
        this.playerNullifierRoot.set(Const.EMPTY_MAP_ROOT);
    }

    /**
     * Verify that the caller is the simulation master
     * @param issues - Array of 3 issues
    */
    // @method async createSimulation() {
    //     // make sure that the simulation does not exist
    //     const numIss = this.numberOfIssues.getAndRequireEquals();
    //     numIss.assertEquals(
    //         Const.EMPTY_FIELD,
    //         Error.SIMULATION_EXISTS
    //       );

    //     // initiate a new simulation
    // }

    /**
     * Create a new nation in the simulation
     * @param name - The name of the nation
    */
    @method async createNation(
        name: CircuitString,
        playerNullifierWitness: MerkleMapWitness
    ) {
        // verify that the player does not have a nation already
        const sender = this.sender.getAndRequireSignature();
        const senderKey = Poseidon.hash(sender.toFields());
        const playerNullRoot = this.playerNullifierRoot.getAndRequireEquals();
        const [derivedRoot, derivedKey] = playerNullifierWitness.computeRootAndKeyV2(Const.EMPTY_FIELD);
        derivedRoot.assertEquals(playerNullRoot,Error.NATION_ALREADY_EXISTS);
        derivedKey.assertEquals(senderKey, Error.NATION_ALREADY_EXISTS);


        // initiate a new nation and store it in the off-chain state
        const nation = new Nation({
            name: name,
            population: Const.INIT_POPULATION,
            gdp: Const.INIT_GDP,
            militaryStrength: Const.INIT_MILITARY_STRENGTH,
            PoliticalFreedom: Const.INIT_FREEDOM,
            PersonalFreedom: Const.INIT_FREEDOM,
            EconomicFreedom: Const.INIT_FREEDOM,
            researchOutput: Const.INIT_OUTPUT,
            industrialOutput: Const.INIT_OUTPUT,
            taxRate: Const.INIT_TAX,
            deathRate: Const.INIT_DEATH_RATE,
            birthRate: Const.INIT_BIRTH_RATE,
            militaryPersonnel: Const.INIT_MILITARY_PERSONNEL,
            welfareBudget: Const.INIT_WELFARE,
            militaryBudget: Const.INIT_MILITARY_BUDGET,
            educationBudget: Const.INIT_EDUCATION_BUDGET,
            wealthGapIndex: Const.INIT_WEALTHGAP,
            crimeIndex: Const.INIT_CRIME,
            happinessNationalIndex: Const.INIT_HNI,
            inclusitivityIndex: Const.INIT_INCLUSITIVITY_INDEX,
            civilRightsIndex: Const.INIT_CIVIL_RIGHTS_INDEX,
            manufacturingIndex: Const.INIT_MANUFACTURING_INDEX,
            environmentIndex: Const.INIT_ENVIRONMENT_INDEX,
        });
        offchainState.fields.nations.overwrite(sender, nation);
        
        // update the merkle maps
        const [updatedRoot, _ ] = playerNullifierWitness.computeRootAndKeyV2(Const.FILLED);
        this.playerNullifierRoot.set(updatedRoot);

        // update the number of nations
        const numNations = this.numberOfNations.getAndRequireEquals();
        this.numberOfNations.set(numNations.add(Field(1)));
    }

    /**
     * Create a new issue in the simulation
     * @param statementHash - The statement hash of the issue
     * @param choices - The choices for the issue
     * 
    */
    // @method async createIssue(
    // ) {
    //     // verify that the caller is the simulation master
    //     // initiate a new issue
    //     // update the number of issues
    //     // update the merkle maps
    //     // update off-chain state
    //     // emit event

    // }

    // @method async makeChoice(
    // ) {
    //     // verify that the caller is the owner of the nation
    //     // verify that the issue is not already revealed
    //     // verify that the issue is valid
    //     // verify that the choice is valid
    //     // update the merkle maps
    //     // update off-chain state
    //     // emit event
    // }

    // @method async revealIssue(
    // ) {
    //     // verify that the caller is the simulation master
    //     // reveal the issue off-chain
    //     // update the number of revealed issues
    //     // update the merkle maps
    //     // emit event
    // }

    

    // @method async computeNationState(
    // ) {
    //     // verify that the caller is the owner of the nation
    //     // verify that the nation is valid
    //     // compute the nation state
    //     // update off-chain state
    //     // emit event
    // }


    /**
     * Settle the off-chain state
     * @param proof - The proof of the off-chain state
     */
    @method async settle(proof: StateProof) {
        await offchainState.settle(proof);
    }
}

// connect contract to off-chain state
offchainState.setContractClass(SimulatorZkApp);