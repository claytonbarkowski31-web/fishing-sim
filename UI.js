export class UI {
    constructor(player) {
        this.player = player;
        this.records = {}; 
        this.container = document.createElement('div');
        // ... (rest of styles)
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        this.container.style.fontFamily = "'Orbitron', sans-serif";
        this.container.style.color = 'white';
        this.container.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        document.body.appendChild(this.container);

        this.setupStats();
        this.setupStatus();
        this.setupPowerBar();
        this.setupTensionBar();
        this.setupLog();
        this.setupCatchModal();
        this.setupShop();

        this.updateStatus('Walking');
        this.updateMoney(0);
    }

    setupStats() {
        this.statsContainer = document.createElement('div');
        this.statsContainer.style.position = 'absolute';
        this.statsContainer.style.top = '20px';
        this.statsContainer.style.right = '20px';
        this.statsContainer.style.textAlign = 'right';
        this.container.appendChild(this.statsContainer);

        this.moneyEl = document.createElement('div');
        this.moneyEl.style.fontSize = '24px';
        this.moneyEl.style.color = '#ffd700';
        this.statsContainer.appendChild(this.moneyEl);

        this.inventoryEl = document.createElement('div');
        this.inventoryEl.innerText = 'Catches: 0';
        this.statsContainer.appendChild(this.inventoryEl);

        this.shopBtn = document.createElement('button');
        this.shopBtn.innerText = 'OPEN SHOP';
        this.shopBtn.style.marginTop = '10px';
        this.shopBtn.style.padding = '10px 20px';
        this.shopBtn.style.fontFamily = "'Orbitron', sans-serif";
        this.shopBtn.style.pointerEvents = 'auto';
        this.shopBtn.onclick = () => this.toggleShop();
        this.statsContainer.appendChild(this.shopBtn);
    }

    setupStatus() {
        this.statusEl = document.createElement('div');
        this.statusEl.style.position = 'absolute';
        this.statusEl.style.bottom = '20px';
        this.statusEl.style.left = '50%';
        this.statusEl.style.transform = 'translateX(-50%)';
        this.statusEl.style.fontSize = '24px';
        this.container.appendChild(this.statusEl);
    }

    setupPowerBar() {
        this.powerBar = document.createElement('div');
        this.powerBar.style.position = 'absolute';
        this.powerBar.style.bottom = '60px';
        this.powerBar.style.left = '50%';
        this.powerBar.style.transform = 'translateX(-50%)';
        this.powerBar.style.width = '200px';
        this.powerBar.style.height = '10px';
        this.powerBar.style.backgroundColor = 'rgba(255,255,255,0.2)';
        this.powerBar.style.display = 'none';
        this.container.appendChild(this.powerBar);

        this.powerInner = document.createElement('div');
        this.powerInner.style.width = '0%';
        this.powerInner.style.height = '100%';
        this.powerInner.style.backgroundColor = '#00ff00';
        this.powerBar.appendChild(this.powerInner);
    }

    setupTensionBar() {
        this.tensionBar = document.createElement('div');
        this.tensionBar.style.position = 'absolute';
        this.tensionBar.style.bottom = '80px';
        this.tensionBar.style.left = '50%';
        this.tensionBar.style.transform = 'translateX(-50%)';
        this.tensionBar.style.width = '200px';
        this.tensionBar.style.height = '20px';
        this.tensionBar.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.tensionBar.style.border = '2px solid white';
        this.tensionBar.style.display = 'none';
        this.container.appendChild(this.tensionBar);

        this.tensionInner = document.createElement('div');
        this.tensionInner.style.width = '50%';
        this.tensionInner.style.height = '100%';
        this.tensionInner.style.backgroundColor = '#ff6600';
        this.tensionBar.appendChild(this.tensionInner);

        const label = document.createElement('div');
        label.innerText = 'TENSION';
        label.style.position = 'absolute';
        label.style.width = '100%';
        label.style.textAlign = 'center';
        label.style.fontSize = '12px';
        label.style.top = '-15px';
        this.tensionBar.appendChild(label);
    }

    setupLog() {
        this.logEl = document.createElement('div');
        this.logEl.style.position = 'absolute';
        this.logEl.style.top = '20px';
        this.logEl.style.left = '20px';
        this.logEl.style.backgroundColor = 'rgba(0,0,0,0.4)';
        this.logEl.style.padding = '10px';
        this.logEl.style.borderRadius = '5px';
        this.logEl.innerHTML = '<strong>FISH LOG</strong><br>No catches yet';
        this.container.appendChild(this.logEl);
    }

    setupCatchModal() {
        this.catchModal = document.createElement('div');
        this.catchModal.style.position = 'absolute';
        this.catchModal.style.top = '50%';
        this.catchModal.style.left = '50%';
        this.catchModal.style.transform = 'translate(-50%, -50%)';
        this.catchModal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        this.catchModal.style.padding = '20px';
        this.catchModal.style.borderRadius = '10px';
        this.catchModal.style.display = 'none';
        this.catchModal.style.textAlign = 'center';
        this.catchModal.style.border = '2px solid #aaa';
        this.catchModal.style.pointerEvents = 'auto'; 
        
        this.catchModal.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.catchModal.style.display = 'none';
        });
        this.container.appendChild(this.catchModal);
    }

    setupShop() {
        this.shopModal = document.createElement('div');
        this.shopModal.style.position = 'absolute';
        this.shopModal.style.top = '50%';
        this.shopModal.style.left = '50%';
        this.shopModal.style.transform = 'translate(-50%, -50%)';
        this.shopModal.style.width = '400px';
        this.shopModal.style.backgroundColor = 'rgba(20,20,20,0.95)';
        this.shopModal.style.padding = '30px';
        this.shopModal.style.borderRadius = '15px';
        this.shopModal.style.display = 'none';
        this.shopModal.style.border = '2px solid #ffd700';
        this.shopModal.style.pointerEvents = 'auto';
        this.container.appendChild(this.shopModal);

        window.isShopOpen = false;
    }

    toggleShop() {
        window.isShopOpen = !window.isShopOpen;
        this.shopModal.style.display = window.isShopOpen ? 'block' : 'none';
        if (window.isShopOpen) this.renderShop();
    }

    renderShop() {
        let html = '<h2 style="color: #ffd700; margin-top: 0;">SHOP</h2>';
        html += `<p>Your Money: $${this.player.money}</p><hr>`;
        
        import('./config.js').then(m => {
            m.CONFIG.SHOP.ITEMS.forEach(item => {
                const canAfford = this.player.money >= item.price;
                html += `
                    <div style="margin-bottom: 20px; border-bottom: 1px solid #444; padding-bottom: 10px;">
                        <strong>${item.name}</strong> - $${item.price}<br>
                        <button 
                            onclick="window.buyItem('${item.id}', ${item.price})" 
                            style="margin-top: 5px; cursor: pointer;"
                            ${canAfford ? '' : 'disabled'}>
                            BUY
                        </button>
                    </div>
                `;
            });
            html += '<button onclick="window.closeShop()" style="width: 100%; margin-top: 10px;">CLOSE</button>';
            this.shopModal.innerHTML = html;
        });

        window.buyItem = (id, price) => {
            if (this.player.money >= price) {
                this.player.money -= price;
                this.updateMoney(this.player.money);
                // Apply bonuses
                import('./config.js').then(m => {
                    const item = m.CONFIG.SHOP.ITEMS.find(i => i.id === id);
                    if (item.bonus.reelSpeed) this.player.upgrades.reelSpeedBonus += item.bonus.reelSpeed;
                    if (item.bonus.biteRate) this.player.upgrades.biteRateBonus += item.bonus.biteRate;
                    this.renderShop();
                });
            }
        };
        window.closeShop = () => this.toggleShop();
    }

    updateMoney(val) {
        this.moneyEl.innerText = `$${val}`;
    }

    updateLog(fish) {
        const weight = parseFloat(fish.weight);
        if (!this.records[fish.name]) {
            this.records[fish.name] = { count: 1, best: weight };
        } else {
            this.records[fish.name].count++;
            if (weight > this.records[fish.name].best) {
                this.records[fish.name].best = weight;
            }
        }

        let logHtml = '<strong>FISH LOG</strong><br>';
        for (const [name, data] of Object.entries(this.records)) {
            logHtml += `${name}: x${data.count} | Best: ${data.best} lbs<br>`;
        }
        this.logEl.innerHTML = logHtml;
    }

    updateStatus(state) {
        if (!this.statusEl) return;
        this.statusEl.innerText = state;
        if (state === 'Walking') {
            this.statusEl.innerText = 'WASD to Move | Hold Left Click to Fish';
            this.powerBar.style.display = 'none';
            this.tensionBar.style.display = 'none';
        } else if (state === 'Casting') {
            this.statusEl.innerText = 'Powering Up...';
            this.powerBar.style.display = 'block';
            this.powerInner.style.backgroundColor = '#00ff00';
        } else if (state === 'Waiting') {
            this.statusEl.innerText = 'Waiting for a bite...';
            this.powerBar.style.display = 'none';
        } else if (state === 'Bite!') {
            this.statusEl.innerText = 'BITE! Click Now!';
        } else if (state === 'Reeling') {
            this.statusEl.innerText = 'REELING! KEEP TENSION IN MIDDLE!';
            this.powerBar.style.display = 'block';
            this.powerInner.style.backgroundColor = '#0066ff';
            this.tensionBar.style.display = 'block';
        } else if (state === 'Caught!') {
            this.statusEl.innerText = 'New Catch!';
            this.powerBar.style.display = 'none';
            this.tensionBar.style.display = 'none';
        }
    }

    showCatch(fish) {
        this.updateLog(fish);
        this.catchModal.innerHTML = `
            <h2 style="color: #ffd700;">CAUGHT! +$${fish.value}</h2>
            <img src="${fish.texture}" style="width: 200px; height: auto; border-radius: 10px; box-shadow: 0 0 20px rgba(255,255,255,0.3);">
            <h3>${fish.name}</h3>
            <p>Weight: ${fish.weight} lbs</p>
            <p style="font-size: 14px; color: #aaa;">Click anywhere to return</p>
        `;
        this.catchModal.style.display = 'block';
        const totalCatches = Object.values(this.records).reduce((acc, curr) => acc + curr.count, 0);
        this.inventoryEl.innerText = `Catches: ${totalCatches}`;
    }

    update(deltaTime, player) {
        if (player.state === 'Casting') {
            this.powerInner.style.width = `${player.castPower * 100}%`;
        } else if (player.state === 'Reeling') {
            this.powerInner.style.width = `${player.reelProgress * 100}%`;
            this.tensionInner.style.width = `${player.reelTension * 100}%`;
            // Color feedback for tension
            if (player.reelTension > 0.8 || player.reelTension < 0.2) {
                this.tensionInner.style.backgroundColor = '#ff0000';
            } else {
                this.tensionInner.style.backgroundColor = '#00ff00';
            }
        }
    }
}
