module.exports = class Card
{
    constructor(name, description, count, number, requiresVictim = true) {
        this.name = name
        this.description = description
        this.count = count
        this.number = number
        this.requiresVictim = requiresVictim
    }

    apply({ player, victim }) {
        if (process.env.NODE_ENV === 'testing')
            return

        console.log(`${player.username} played the ${this.name}`)
        console.log('Player:', player)
        if (victim)
            console.log('Victim:', victim)
    }
}