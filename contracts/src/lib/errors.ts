export namespace Error {
    // simulation errors
    export const SIMULATION_ALREADY_EXISTS = 'Simulation already exists';
    export const SIMULATION_MASTER_ONLY = 'Only the simulation master is allowed';

    // nation errors
    export const NATION_ALREADY_EXISTS = 'Nation already exists';
    export const PLAYER_HAS_NO_NATION = 'The player has no nation';

    // reveal errors
    export const ISSUE_ALREADY_REVEALED = 'Issue already revealed';
    export const INVALID_ISSUES_DURING_REVEAL = 'Invalid issues during reveal';

    // choice errors
    export const INVALID_ISSUE = 'Invalid issue';
    export const INVALID_CHOICE = 'Invalid choice';
    export const CHOICE_ALREADY_MADE = 'Choice already made';
    
}