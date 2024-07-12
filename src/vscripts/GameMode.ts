import { reloadable } from "./lib/tstl-utils";
import { modifier_panic } from "./modifiers/modifier_panic";
import { RuneSpawner } from "./rune_spawner";
import { Wave } from "./wave";

const heroSelectionTime = 20;

declare global {
    interface CDOTAGameRules {
        Addon: GameMode;
    }
}

@reloadable
export class GameMode {
    runeSpawner = new RuneSpawner()

    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource("particle", "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts", context);
    }

    public static Activate(this: void) {
        // When the addon activates, create a new instance of this GameMode class.
        GameRules.Addon = new GameMode();
    }

    constructor() {
        this.configure();

        // Register event listeners for dota engine events
        ListenToGameEvent("game_rules_state_change", () => this.OnStateChange(), undefined);
        ListenToGameEvent("npc_spawned", event => this.OnNpcSpawned(event), undefined);

        // Register event listeners for events from the UI
        CustomGameEventManager.RegisterListener("ui_panel_closed", (_, data) => {
            print(`Player ${data.PlayerID} has closed their UI panel.`);

            // Respond by sending back an example event
            const player = PlayerResource.GetPlayer(data.PlayerID)!;
            CustomGameEventManager.Send_ServerToPlayer(player, "example_event", {
                myNumber: 42,
                myBoolean: true,
                myString: "Hello!",
                myArrayOfNumbers: [1.414, 2.718, 3.142]
            });

            // Also apply the panic modifier to the sending player's hero
            const hero = player.GetAssignedHero();
            hero.AddNewModifier(hero, undefined, modifier_panic.name, { duration: 5 });
        });
    }

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 3);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 3);

        GameRules.SetShowcaseTime(0);
        GameRules.SetStrategyTime(0);
        GameRules.SetPreGameTime(0);
        GameRules.SetPostGameTime(10);
        GameRules.SetHeroSelectPenaltyTime(0);


        GameRules.SetHeroSelectionTime(heroSelectionTime);
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();

        // Add 4 bots to lobby in tools
        if (IsInToolsMode() && state == GameState.CUSTOM_GAME_SETUP) {
            for (let i = 0; i < 4; i++) {
                // Tutorial.AddBot("npc_dota_hero_lina", "", "", false);
                // add most  agressive bots
                Tutorial.AddBot("npc_dota_hero_lina", "hard", "mid", false);
            }
        }

        if (state === GameState.CUSTOM_GAME_SETUP) {
            // Automatically skip setup in tools
            if (IsInToolsMode()) {
                Timers.CreateTimer(0.3, () => {
                    GameRules.FinishCustomGameSetup();
                });
            }
        }
        // if (state === GameState.HERO_SELECTION) {
        //     if (IsInToolsMode()) {
        //         Timers.CreateTimer(0.3, () => {
        //             // pick random hero for player
        //             const player = PlayerResource.GetPlayer(0);
        //             if (player) {
        //                 player.MakeRandomHeroSelection();
        //             }
        //         });
        //     }
        // }

        // Start game once pregame hits
        if (state === GameState.PRE_GAME) {
            print("Pre-game phase started!");
            Timers.CreateTimer(0.2, () => this.StartGame());
        }
    }

    private StartGame(): void {
        print("Game starting!");

        // Do some stuff here
        Timers.CreateTimer(1, () => {
            let waver1 = new Wave("radiant_spawn_1", "radiant_spawn_1_10", "npc_dota_roshan_halloween_minion", DotaTeam.GOODGUYS)
            return 5;
        })
        Timers.CreateTimer(1, () => {
            //for (let i = 0; i < 4; i++)
            // new Wave("dire_spawn_1", "dire_spawn_1_1", "npc_dota_creep_badguys_melee", DotaTeam.BADGUYS)
            new Wave("dire_spawn_2", "dire_spawn_1_1", "npc_dota_creep_badguys_melee", DotaTeam.BADGUYS)
            return 2;
        })
        Timers.CreateTimer(6, () => {
            //for (let i = 0; i < 4; i++)
            new Wave("dire_spawn_1", "dire_spawn_1_1", "npc_dota_creep_badguys_melee", DotaTeam.BADGUYS)
            // new Wave("dire_spawn_2", "dire_spawn_1_1", "npc_dota_creep_badguys_melee", DotaTeam.BADGUYS)
            return 3;
        })

        Timers.CreateTimer(5, () => {
            for (let i = 0; i < 20; i++) {
                this.runeSpawner.spawnRune();
            }
            return 5.0; // Повторяем таймер каждые 10 секунд
        });

        Timers.CreateTimer(5, () => {
            let good_boss_spawn = Entities.FindByName(undefined, "good_boss_spawn")!.GetAbsOrigin()
            let good_boss = CreateUnitByName("npc_good_boss", good_boss_spawn, true, void 0, void 0, DotaTeam.GOODGUYS)
            // Timers.CreateTimer(5, () => {
            //     good_boss.MoveToPositionAggressive(GetGroundPosition(good_boss_spawn, undefined))
            //     return 15;
            // })
            for (let i = 1; i <= 6; i++) {
                let bad_boss_spawn = Entities.FindByName(undefined, `bad_boss_spawn${i}`)!.GetAbsOrigin()
                let bad_boss = CreateUnitByName("npc_bad_boss", bad_boss_spawn, true, void 0, void 0, DotaTeam.BADGUYS)
            }
        })

    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");

        // Do some stuff here
    }

    private OnNpcSpawned(event: NpcSpawnedEvent) {
        // After a hero unit spawns, apply modifier_panic for 8 seconds
        const unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC; // Cast to npc since this is the 'npc_spawned' event
        // Give all real heroes (not illusions) the meepo_earthbind_ts_example spell
        if (unit.IsRealHero()) {
            if (!unit.HasAbility("meepo_earthbind_ts_example")) {
                // Add lua ability to the unit
                unit.AddAbility("meepo_earthbind_ts_example");
            }
        }
    }


    // private SpawnCouriersForHeroes(): void {
    //     // Получаем список всех героев
    //     const heroes = PlayerResource.GetAllHer();

    //     // Перебираем всех героев
    //     heroes.forEach(hero => {
    //         // Проверяем, есть ли у героя курица
    //         if (!this.DoesHeroHaveCourier(hero)) {
    //             // Создаем курицу для героя
    //             this.CreateCourierForHero(hero);
    //         }
    //     });
    // }

    // private DoesHeroHaveCourier(hero: CDOTA_BaseNPC_Hero): boolean {
    //     // Здесь должна быть логика для проверки наличия курицы у героя
    //     // Это может быть реализовано через проверку определенного предмета или переменной состояния
    //     return false; // Пример возвращает false для демонстрации
    // }

    // private CreateCourierForHero(hero: CDOTA_BaseNPC_Hero): void {
    //     // Создаем курицу
    //     const courier = CreateUnitByName("npc_dota_courier", hero.GetAbsOrigin(), true, hero, null, hero.GetTeam());
    //     // Назначаем героя владельцем курицы
    //     courier.SetControllableByPlayer(hero.GetPlayerID(), false);
    // }






}
