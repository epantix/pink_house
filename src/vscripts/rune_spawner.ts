

export class RuneSpawner {
    generateRandomPointWithinBounds(): Vector {
        const minX = GetWorldMinX();
        const maxX = GetWorldMaxX();
        const minY = GetWorldMinY();
        const maxY = GetWorldMaxY();


        const x = Math.random() * (maxX - minX) + minX;
        const y = Math.random() * (maxY - minY) + minY;
        return Vector(x, y, 0); // Z координата будет вычислена позже
    }

    isPointFree(point: Vector): boolean {
        // Здесь должна быть логика проверки, что в данной точке нет других объектов.
        // Это может быть реализовано через вызов API, который проверяет наличие объектов в данной точке.
        // Возвращаем true для примера.

        return true;
    }


    spawnRuneAtPoint(point: Vector) {
        // Логика создания руны в данной точке.
        print(`Создание руны в точке (${point.x}, ${point.y}, ${point.z})`);
        const rune = CreateRune(point, Math.floor(Math.random() * 10))

        Timers.CreateTimer(10, () => {
            if (rune && IsValidEntity(rune)) {
                UTIL_Remove(rune);
            }
        });
    }

    spawnRune() {
        print(`Создание руны`);
        for (let i = 0; i < 1000; i++) {
            let point = this.generateRandomPointWithinBounds();
            if (!this.isPointFree(point)) continue;
            point = GetGroundPosition(point, undefined); // Вычисляем высоту для точки
            this.spawnRuneAtPoint(point);
            break
        }
    }

}