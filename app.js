const APP = {
    config: {},
    schema: {},
    api: null,
    canvas: null,
    ctx: null,
    nodes: [],
    links: [],
    camera: { x: 0, y: 0, zoom: 1, rot: 0 },

    init(config, schema, api) {
        this.config = config;
        this.schema = schema;
        this.api = api;
        this.canvas = document.getElementById('renderCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        window.addEventListener('resize', () => this.resize());
        this.resize();

        if (this.config.features.use3DUniverse) {
            this.startLoop();
            this.status("3D Universe Online");
        } else {
            this.status("2D Fallback Active");
        }
        this.refreshData();
    },

    status(msg) { document.getElementById('status').innerText = msg; },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    refreshData() {
        const graph = this.api.getGraph();
        this.nodes = graph.nodes;
        this.links = graph.links;
    },

    ui: {
        addRandomNode() {
            const newNode = {
                id: "n" + Date.now(),
                label: "Neuron-" + Math.floor(Math.random()*1000),
                position: { 
                    x: (Math.random() - 0.5) * 500, 
                    y: (Math.random() - 0.5) * 500, 
                    z: (Math.random() - 0.5) * 500 
                }
            };
            if(APP.api.addNode(newNode)) {
                APP.refreshData();
            }
        }
    },

    // "3D" Engine (Orthographic Projection Simulation)
    project(pos) {
        const factor = this.camera.zoom / (1 + (pos.z + 500) / 1000);
        return {
            x: this.canvas.width / 2 + pos.x * factor,
            y: this.canvas.height / 2 + pos.y * factor,
            size: 15 * factor
        };
    },

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render Links
        this.ctx.strokeStyle = "rgba(0, 255, 204, 0.2)";
        this.links.forEach(l => {
            const s = this.nodes.find(n => n.id === l.source);
            const t = this.nodes.find(n => n.id === l.target);
            if(s && t) {
                const p1 = this.project(s.position);
                const p2 = this.project(t.position);
                this.ctx.beginPath();
                this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.stroke();
            }
        });

        // Render Nodes
        this.nodes.forEach(n => {
            const p = this.project(n.position);
            this.ctx.fillStyle = "#00ffcc";
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = "white";
            this.ctx.fillText(n.label, p.x + 10, p.y);
        });
    },

    startLoop() {
        const loop = () => {
            // Auto-Rotation logic
            this.nodes.forEach(n => {
                const x = n.position.x;
                const z = n.position.z;
                n.position.x = x * Math.cos(0.005) - z * Math.sin(0.005);
                n.position.z = z * Math.cos(0.005) + x * Math.sin(0.005);
            });
            this.render();
            requestAnimationFrame(loop);
        };
        loop();
    }
};
window.APP = APP;
