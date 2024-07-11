import { reloadable } from "./lib/tstl-utils";

@reloadable
export class Wave {
    from: string;
    to: string;
    clazz: string;
    team: DotaTeam;
    constructor(from: string, to: string, clazz: string, team: DotaTeam) {
        this.from = from;
        this.to = to;
        this.clazz = clazz;
        this.team = team;
        this.start()
    }

    start() {
        print(`asd ${this.from} ${this.to}`)
        let point = GetGroundPosition(Entities.FindByName(undefined, this.from)!.GetAbsOrigin(), undefined)
        print(point)
        let target = Entities.FindByName(undefined, this.to)


        print(target!.GetAbsOrigin())
        let creep = CreateUnitByName(this.clazz, point,
            true, void 0, void 0, this.team)
        print(creep)
        creep.SetInitialGoalEntity(target)
        // creep.SetControllableByPlayer(0, true)
        creep.MoveToPositionAggressive(GetGroundPosition(target!.GetAbsOrigin(), undefined))

        // print(GridNav.CanFindPath(point, GetGroundPosition(target!.GetAbsOrigin(), undefined)))

    }
}