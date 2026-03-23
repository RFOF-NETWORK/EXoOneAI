const API = {
    config: {},
    schema: {},
    db: { nodes: [], links: [] },

    init(config, schema) {
        this.config = config;
        this.schema = schema;
        this.loadFromStorage();
        
        // Seed initial data if empty
        if (this.db.nodes.length === 0) {
            this.db.nodes.push({id: "root", label: "Core", position: {x:0, y:0, z:0}});
        }
    },

    validate(data, section) {
        if (!this.config.features.useCustomValidator) return true;
        const rules = this.schema.data_schema[section];
        if (!rules) return false;

        // Simple Requirement Check
        return Object.keys(rules).every(key => {
            if (rules[key] === "string" && typeof data[key] !== "string") return false;
            if (rules[key] === "number" && typeof data[key] !== "number") return false;
            return true;
        });
    },

    saveToStorage() {
        if (this.config.features.useLocalStorage) {
            localStorage.setItem('pzqqet_data', JSON.stringify(this.db));
        }
    },

    loadFromStorage() {
        if (this.config.features.useLocalStorage) {
            const data = localStorage.getItem('pzqqet_data');
            if (data) this.db = JSON.parse(data);
        }
    },

    getGraph() {
        return this.db;
    },

    addNode(nodeData) {
        if (this.validate(nodeData, "node")) {
            this.db.nodes.push(nodeData);
            // Auto-Link to last node for visual connection
            if(this.db.nodes.length > 1) {
                this.addLink({
                    id: "l"+Date.now(),
                    source: this.db.nodes[this.db.nodes.length - 2].id,
                    target: nodeData.id,
                    weight: 1
                });
            }
            this.saveToStorage();
            return true;
        }
        return false;
    },

    addLink(linkData) {
        if (this.validate(linkData, "link")) {
            this.db.links.push(linkData);
            this.saveToStorage();
            return true;
        }
        return false;
    }
};
window.API = API;
