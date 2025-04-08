import { store } from '../main.js';
import { embed, getFontColour } from '../util.js';
import { score } from '../score.js';
import { fetchEditors, fetchList } from '../content.js';

import Spinner from '../components/Spinner.js';
import LevelAuthors from '../components/List/LevelAuthors.js';

const roleIconMap = {
	owner: 'crown',
    kreo: 'kreo',
	admin: 'user-gear',
	seniormod: 'user-shield',
	mod: 'user-lock',
    trial: 'user-check',
	dev: 'code'
};

export default {
	components: { Spinner, LevelAuthors },
	template: `
        <main v-if="loading" class="surface">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container surface">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 150" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container surface">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <div class="packs" v-if="level.packs.length > 0">
                        <div v-for="pack in level.packs" class="tag" :style="{background:pack.colour}">
                            <p :style="{color:getFontColour(pack.colour)}">{{pack.name}}</p>
                        </div>
                    </div>
                    <div v-if="level.showcase" class="tabs">
                        <button class="tab type-label-lg" :class="{selected: !toggledShowcase}" @click="toggledShowcase = false">
                            <span class="type-label-lg">Verification</span>
                        </button>
                        <button class="tab" :class="{selected: toggledShowcase}" @click="toggledShowcase = true">
                            <span class="type-label-lg">Showcase</span>
                        </button>
                    </div>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>{{ level.password || 'Free to Copy' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 75"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else-if="selected +1 <= 150"><strong>100%</strong> or better to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store?.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container surface">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <template v-if="editors">
                        <h2>List Editors</h2>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${(store.dark || store.shitty) ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h2> List Rules </h2>
                    <p><i>read this now</i></p>
                    <h3> Level Standards / Rules </h3>
                    <p>For a level to be added, 50% of the creators and the verifier must be in the server.</p>
                    <p>A level must have decent, playable gameplay at the very minimum.</p>
                    <p>A level must be of decent quality in decoration too. The level must be structured and have decent quality.</p>
                    <p>We also allow effect layouts, as long as they are structured of course.</p>
                    <p>The minimum standard for decoration we will allow is the level <b>xo by KrmaL</b>.</p>
                    <p>A level must not be unfair, such as random triggers or inescapable death.</p>
                    <p>A level must not be too hard compared to the current top 1. We want a steady top 1 progression--not a massive jump from entry level extreme to mainlist.</p>
                    <h3> Record Submission Requirements </h3>
                    <p>FPS Bypass is allowed, but physics bypass is not. You must use the default 240 TPS.</p>
                    <p>CBF is allowed.</p>
                    <p>Have audible click sounds throughout the entire video.</p>
                    <p>If you edit your record video at all, please provide raw footage to us in your submission.</p>
                    <p>Your recording must also include the previous death.</p>
                    <p>If you beat it on the first attempt, you must include footage of you pressing play and loading into the level.</p>
                    <p>Cheating in any way is not permitted. This includes:</p>
                    <p>- Noclip.</p>
                    <p>- Secret Ways.</p>
                    <p>- Macros or Replay Bot.</p>
                    <p>- Beating the level on a modified version of the level.</p>
                    <p>If you need to use an LDM, request that the creator of the level add an LDM to the level. Making one yourself is not permitted as that is modification of the level.</p>
                    <h3> More Info </h3>
                    <p>The top 25 is considered mainlist.</p>
                    <p>The top 50 is considered extended list.</p>
                    <p>Everything below that is considered legacy.</p>
                    <p>New records for legacy levels are not accepted whatsoever.</p>
                </div>
            </div>
        </main>
    `,
	data: () => ({
		list: [],
		editors: [],
		loading: true,
		selected: 0,
		errors: [],
		roleIconMap,
		store,
		toggledShowcase: false,
	}),
	computed: {
		level() {
			return this.list[this.selected][0];
		},
		video() {
			if (!this.level.showcase) {
				return embed(this.level.verification);
			}

			return embed(
				this.toggledShowcase ? this.level.showcase : this.level.verification,
			);
		},
	},
	async mounted() {
		store.list = this;
        await resetList();
	},
	methods: {
		embed,
		score,
        getFontColour
	},
};

export async function resetList() {
    console.log("resetting");
    
    store.list.loading = true;

    // Hide loading spinner
    store.list.list = await fetchList();
    store.list.editors = await fetchEditors();

    // Error handling
    if (!store.list.list) {
        store.list.errors = [
            "Failed to load list. Retry in a few minutes or notify list staff.",
        ];
    } else {
        store.list.errors.push(
            ...store.list.list
                .filter(([_, err]) => err)
                .map(([_, err]) => {
                    return `Failed to load level. (${err}.json)`;
                })
        );
        if (!store.list.editors) {
            store.list.errors.push("Failed to load list editors.");
        }
    }

    store.list.loading = false;
}
