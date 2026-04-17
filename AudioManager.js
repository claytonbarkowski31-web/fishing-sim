import * as Tone from 'tone';

export class AudioManager {
    constructor() {
        this.isStarted = false;
        this.setupSynths();
    }

    async start() {
        if (this.isStarted) return;
        await Tone.start();
        this.isStarted = true;
        this.playAmbience();
    }

    setupSynths() {
        // Water splash sound
        this.splashNoise = new Tone.Noise('white').start();
        this.splashFilter = new Tone.Filter(2000, 'lowpass').toDestination();
        this.splashEnv = new Tone.AmplitudeEnvelope({
            attack: 0.01,
            decay: 0.2,
            sustain: 0,
            release: 0.2
        }).connect(this.splashFilter);
        this.splashNoise.connect(this.splashEnv);

        // Reel sound
        this.reelSynth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: 'sine' }
        }).toDestination();
        this.reelSynth.volume.value = -10;

        // Catch success sound
        this.successSynth = new Tone.PolySynth(Tone.Synth).toDestination();
        this.successSynth.volume.value = -10;

        // Ambiance (wind/water)
        this.ambienceNoise = new Tone.Noise('pink').start();
        this.ambienceFilter = new Tone.AutoFilter({
            frequency: 0.1,
            baseFrequency: 400,
            octaves: 2.6
        }).connect(Tone.Destination).start();
        this.ambienceNoise.connect(this.ambienceFilter);
        this.ambienceNoise.volume.value = -30;
    }

    playAmbience() {
        if (!this.isStarted) return;
        // Ambience is already connected and started in setupSynths
    }

    playSplash() {
        if (!this.isStarted) return;
        this.splashEnv.triggerAttackRelease(0.2);
    }

    playCast() {
        if (!this.isStarted) return;
        const synth = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
        }).toDestination();
        synth.triggerAttackRelease(0.1);
    }

    playBite() {
        if (!this.isStarted) return;
        const synth = new Tone.MetalSynth().toDestination();
        synth.volume.value = -15;
        synth.triggerAttackRelease('C4', '16n');
    }

    playReel() {
        if (!this.isStarted) return;
        this.reelSynth.triggerAttackRelease('G1', '32n');
    }

    playCatch() {
        if (!this.isStarted) return;
        this.successSynth.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '4n');
    }
}
