import type { Rectangle } from "../interfaces";

export class QuadTree {
    private objects: any[] = [];
    private nodes: QuadTree[] = [];
    
    constructor(
        private bounds: Rectangle,
        private maxObjects: number = 10,
        private maxLevels: number = 5,
        private level: number = 0
    ) {}
    
    insert(obj: any): void {
        if (this.nodes.length > 0) {
            const index = this.getIndex(obj);
            if (index !== -1) {
                this.nodes[index].insert(obj);
                return;
            }
        }
        
        this.objects.push(obj);
        
        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            if (this.nodes.length === 0) {
                this.split();
            }
            
            let i = 0;
            while (i < this.objects.length) {
                const index = this.getIndex(this.objects[i]);
                if (index !== -1) {
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                } else {
                    i++;
                }
            }
        }
    }
    
    retrieve(rect: Rectangle): any[] {
        const returnObjects = [...this.objects];
        
        if (this.nodes.length > 0) {
            const index = this.getIndex(rect);
            if (index !== -1) {
                returnObjects.push(...this.nodes[index].retrieve(rect));
            } else {
                this.nodes.forEach(node => {
                    returnObjects.push(...node.retrieve(rect));
                });
            }
        }
        
        return returnObjects;
    }
    
    private split(): void {
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;
        
        this.nodes[0] = new QuadTree({
            x: x + subWidth, y: y, width: subWidth, height: subHeight
        }, this.maxObjects, this.maxLevels, this.level + 1);
        
        this.nodes[1] = new QuadTree({
            x: x, y: y, width: subWidth, height: subHeight
        }, this.maxObjects, this.maxLevels, this.level + 1);
        
        this.nodes[2] = new QuadTree({
            x: x, y: y + subHeight, width: subWidth, height: subHeight
        }, this.maxObjects, this.maxLevels, this.level + 1);
        
        this.nodes[3] = new QuadTree({
            x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight
        }, this.maxObjects, this.maxLevels, this.level + 1);
    }
    
    private getIndex(rect: Rectangle): number {
        let index = -1;
        const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
        
        const topQuadrant = rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint;
        const bottomQuadrant = rect.y > horizontalMidpoint;
        
        if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
            if (topQuadrant) index = 1;
            else if (bottomQuadrant) index = 2;
        } else if (rect.x > verticalMidpoint) {
            if (topQuadrant) index = 0;
            else if (bottomQuadrant) index = 3;
        }
        
        return index;
    }
}