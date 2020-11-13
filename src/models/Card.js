module.exports = class Card
{
    constructor(name, description, count, number, requiresVictim = true, canPlayAgainstSelf = false) {
        this.name = name
        this.description = description
        this.count = count
        this.number = number
        this.requiresVictim = requiresVictim
        this.canPlayAgainstSelf = canPlayAgainstSelf
    }

    apply({ player, victim }) {
        if (process.env.NODE_ENV === 'testing')
            return

        console.log(`${player.username} played the ${this.name}`)
        console.log('Player:', player)
        if (victim)
            console.log('Victim:', victim)
    }

    discard({ player }) {
        return { success: true, log: `${player.username} has discarded the ${this.name}.` }
    }
}