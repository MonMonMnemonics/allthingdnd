export type Condition = {
    name: string,
    effect: string
}

export const conditions: Condition[] = [
    { name: "Blinded", effect: "Attack with disadv, attacked with disadv"},
    { name: "Charmed", effect: "Charmer social check with adv, cannot attack charmer"},
    { name: "Frightened", effect: "Disadv on attack and check when source of fear is visible"},
    { name: "Grappled", effect: "Immobile"},
    { name: "Invisible", effect: "Attack with adv, attacked with disadv"},
    { name: "Paralyzed", effect: "Attacked with adv, melee hit with crits, cannot move or speak"},
    { name: "Petrified", effect: "Attacked with adv, resistace to all dmg and immune to poison"},
    { name: "Poisoned", effect: "Attack and check with disadv"},
    { name: "Prone", effect: "Halved speed, attack with disadv, attacked with adv if melee, disadv if ranged"},
    { name: "Restrained", effect: "Immobile, attack with disadv, attacked with adv"},
    { name: "Stun", effect: "Attacked with adv, melee hit with crits"},
    { name: "Exhaustion", effect: "1 Disadv on checks, 2 halved speed, 3 disadv on attack and saving throws, 4 halved max hp, 5 speed 0, 6 death. Long rest reduces 1"},
]