import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function T($$anchor, $$props) {
	$.push($$props, true);

	let n = $.prop($$props, 'n', 3, 1);

	$.user_effect(() => {
		console.log(n());
	});

	$.pop();
}