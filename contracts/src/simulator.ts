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
    Experimental,
    UInt64,
    Bool
  } from 'o1js';
  
import { Const } from './lib/consts';
import { Error } from './lib/errors';
import { Nation, IssueStatement, Issue, ChoiceConsequence, IssueConsequence } from './lib/models';

/**
 *  Off-chain state setup
*/
const { OffchainState, OffchainStateCommitments } = Experimental;
const offchainState = OffchainState({
    nations: OffchainState.Map(PublicKey, Nation), // map is (playerAddress -> Nation)
    issueStatements: OffchainState.Map(Field, IssueStatement), // map is (issueId -> IssueStatement)
    issueConsequences: OffchainState.Map(Field, IssueConsequence), // map is (issueId -> IssueConsequence)
    nationChoices: OffchainState.Map(Field, Field),  // map is (choiceKey -> ChoiceId)
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
    @state(Field) issuesRevealed = State<Field>(); // The number of issues revealed in the simulation, by the simulation master
    @state(Field) issuesHash = State<Field>(); // Issues hash stored on-chain, to check validity later
    @state(Field) simulationMaster = State<Field>(); // The player who created the simulation
    @state(Field) playerNullifierRoot = State<Field>(); // MerkleMap <playerAddress -> Field(0)|Field(1)>
    @state(Field) choiceNullifierRoot = State<Field>(); // MerkleMap <IssueId(Combination of Player, Issue) -> Field(0)|Field(1)>
    
    
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
        this.issuesRevealed.set(Const.EMPTY_FIELD);
        this.issuesHash.set(Const.EMPTY_FIELD);
        this.numberOfNations.set(Const.EMPTY_FIELD);
        this.simulationMaster.set(Const.EMPTY_KEY);
        this.playerNullifierRoot.set(Const.EMPTY_MAP_ROOT);

    }

    /**
     * Verify that the caller is the simulation master
     * @param issues - Array of issues
    */
    @method async createSimulation(
        issues: Issue[]
    ) {

        // make sure that no issues have been created yet
        const numIssues = this.numberOfIssues.getAndRequireEquals();
        numIssues.assertEquals(Const.EMPTY_FIELD, Error.SIMULATION_ALREADY_EXISTS);

        // make sure no simulation master has been set yet
        const simMaster = this.simulationMaster.getAndRequireEquals();
        simMaster.assertEquals(Const.EMPTY_KEY, Error.SIMULATION_ALREADY_EXISTS);

        // store issue statements in the off-chain state
        for (let i = 0; i < issues.length; i++) {
            const issue = issues[i];
            const issueId = Field(i);
            offchainState.fields.issueStatements.overwrite(issueId, issue.statement);
        }

        // store issue hash on-chain to check validity later
        const issueHashes = issues.map(issue => Poseidon.hash(Issue.toFields(issue)));
        const issueHash = Poseidon.hash(issueHashes);
        this.issuesHash.set(issueHash);

        // set the simulation master
        const sender = this.sender.getAndRequireSignature();
        const senderKey = Poseidon.hash(sender.toFields());
        this.simulationMaster.set(senderKey);

        // update the number of issues
        const numberOfIssues = Field(issues.length);
        this.numberOfIssues.set(numberOfIssues);
    }

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
     *  Make a choice for an issue
     * @param issueId - The id of the issue
     * @param choiceId - The choice made by the nation
     * @param playerNullifierWitness - The witness for the player nullifier
     * @param choiceNullifierWitness - The witness for the choice nullifier
     */
    @method async makeChoice(
        issueId: Field,
        choiceId: Field,
        playerNullifierWitness: MerkleMapWitness,
        choiceNullifierWitness: MerkleMapWitness
    ) {
        // verify that caller has a nation
        const sender = this.sender.getAndRequireSignature();
        const senderKey = Poseidon.hash(sender.toFields());
        const playerNullRoot = this.playerNullifierRoot.getAndRequireEquals();
        const [derivedRoot, derivedKey] = playerNullifierWitness.computeRootAndKeyV2(Const.FILLED);
        derivedRoot.assertEquals(playerNullRoot,Error.PLAYER_HAS_NO_NATION);
        derivedKey.assertEquals(senderKey, Error.PLAYER_HAS_NO_NATION);

        // get the nation
        const nation = await offchainState.fields.nations.get(sender)

        // verify that the issues are not already revealed
        const isRevealed = this.issuesRevealed.getAndRequireEquals();
        isRevealed.assertEquals(Const.EMPTY_FIELD, Error.ISSUE_ALREADY_REVEALED);

        // verify that the issue is valid
        issueId.assertLessThan(this.numberOfIssues.getAndRequireEquals(), Error.INVALID_ISSUE);

        // verify that the choice is valid
        choiceId.assertLessThan(Field(3), Error.INVALID_CHOICE);

        // verify that the choice is not already made
        const choiceKey = Poseidon.hash([senderKey, issueId]);
        const choiceNullRoot = this.choiceNullifierRoot.getAndRequireEquals();
        const [derivedRootChoice, derivedKeyChoice] = choiceNullifierWitness.computeRootAndKeyV2(Const.EMPTY_FIELD);
        derivedRootChoice.assertEquals(choiceNullRoot, Error.CHOICE_ALREADY_MADE);
        derivedKeyChoice.assertEquals(choiceKey, Error.CHOICE_ALREADY_MADE);

        // update off-chain state
        offchainState.fields.nationChoices.overwrite(choiceKey, choiceId);

        // update the merkle maps
        const [updatedRoot, _ ] = choiceNullifierWitness.computeRootAndKeyV2(Const.FILLED);
        this.choiceNullifierRoot.set(updatedRoot);
    }    

    /**
     * Reveal the issues of the simulation, by the simulation master
     * after revealing the issues, the nations can compute their state
     * @param nation - The new state of the nation
     */
    @method async revealIssues(
        issues: Issue[]
    ) {
        // verify that the caller is the simulation master
        const sender = this.sender.getAndRequireSignature();
        const senderKey = Poseidon.hash(sender.toFields());
        const simMaster = this.simulationMaster.getAndRequireEquals();
        simMaster.assertEquals(senderKey, Error.SIMULATION_MASTER_ONLY);

        // verify that the issues are not already revealed
        const isRevealed = this.issuesRevealed.getAndRequireEquals();
        isRevealed.assertEquals(Const.EMPTY_FIELD, Error.ISSUE_ALREADY_REVEALED);

        // verify that the issues are valid
        const issueHashes = issues.map(issue => Poseidon.hash(Issue.toFields(issue)));
        const issueHash = Poseidon.hash(issueHashes);
        const storedIssueHash = this.issuesHash.getAndRequireEquals();
        issueHash.assertEquals(storedIssueHash, Error.INVALID_ISSUES_DURING_REVEAL);

        // store the issue consequences in the off-chain state (reveal the issues)
        for (let i = 0; i < issues.length; i++) {
            const issue = issues[i];
            const issueId = Field(i);
            offchainState.fields.issueConsequences.overwrite(issueId, issue.consequence);
        }

        // update the merkle maps
        this.issuesRevealed.set(Const.FILLED);
    }

    @method async computeNationState(
        playerNullifierWitness: MerkleMapWitness
    ) {
        // verify that caller has a nation
        const sender = this.sender.getAndRequireSignature();
        const senderKey = Poseidon.hash(sender.toFields());
        const playerNullRoot = this.playerNullifierRoot.getAndRequireEquals();
        const [derivedRoot, derivedKey] = playerNullifierWitness.computeRootAndKeyV2(Const.FILLED);
        derivedRoot.assertEquals(playerNullRoot,Error.PLAYER_HAS_NO_NATION);
        derivedKey.assertEquals(senderKey, Error.PLAYER_HAS_NO_NATION);

        // get the nation
        const nation = await offchainState.fields.nations.get(sender)
        const numIssues = this.numberOfIssues.getAndRequireEquals();
        
        // iterate over the issues
        for (let i = 0; i < numIssues.toBigInt(); i++) {

            // get the choice made by the nation
            const issueId = Field(i);
            const choiceKey = Poseidon.hash([senderKey, issueId]);
            const choiceId = await offchainState.fields.nationChoices.get(choiceKey);
     
            // compute state based on the choice
            const consequence = await offchainState.fields.issueConsequences.get(issueId);
            const choiceConsequenceOne = consequence.value.one;
            const value = choiceConsequenceOne.value;
            
            nation.value.PoliticalFreedom = nation.value.PoliticalFreedom.add(value[3]);
            nation.value.PersonalFreedom = nation.value.PersonalFreedom.add(value[4]);
            nation.value.EconomicFreedom = nation.value.EconomicFreedom.add(value[5]);
            
            // update offchain nation for every issue
            offchainState.fields.nations.overwrite(sender, new Nation(nation.value));
        }
    }


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