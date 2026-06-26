// 250625 Set maxContentHeight to integer, code refactoring

const DESKTOP_BREAKPOINT = 600;
const RESIZE_DEBOUNCE_DELAY = 150;

function isImageElement(child: Element): child is HTMLImageElement {
	return child.tagName === "IMG";
}

function isPictureElement(child: Element): child is HTMLPictureElement {
	return child.tagName === "PICTURE";
}

function isNonImageElement(child: Element): child is HTMLElement {
	return child.tagName !== "IMG" && child.tagName !== "PICTURE";
}

const containerCache = new Map<
	HTMLElement,
	{
		images: HTMLImageElement[];
		pictures: HTMLPictureElement[];
		nonImageElements: HTMLElement[];
	}
>();

let debouncedResize: (...args: any[]) => void;
let isInitialized = false;

function matchSplitScreenImageHeights(): void {
	try {
		const isDesktop = window.matchMedia(
			`(min-width: ${DESKTOP_BREAKPOINT}px)`,
		).matches;

		const splitScreens = document.querySelectorAll<HTMLElement>(
			".full-width-split-screen",
		);
		if (splitScreens.length === 0) return;

		for (const container of splitScreens) {
			const isOverlay = container.classList.contains("overlay");
			const isCentered = container.classList.contains("centered");

			if (!isDesktop && !isOverlay) {
				const cachedElements = containerCache.get(container);
				if (cachedElements) {
					resetElementHeights(cachedElements.images, cachedElements.pictures);
				}
				continue;
			}

			if (isCentered) {
				const cachedElements = containerCache.get(container);
				if (cachedElements) {
					resetElementHeights(cachedElements.images, cachedElements.pictures);
				}
				continue;
			}

			processContainer(container);
		}
	} catch (error) {
		console.warn("Error matching split screen heights:", error);
	}
}

function processContainer(container: HTMLElement): void {
	let cachedElements = containerCache.get(container);

	if (!cachedElements) {
		const children = Array.from(container.children);
		cachedElements = {
			images: children.filter(isImageElement),
			pictures: children.filter(isPictureElement),
			nonImageElements: children.filter(isNonImageElement),
		};
		containerCache.set(container, cachedElements);
	}

	const { images, pictures, nonImageElements } = cachedElements;

	resetElementHeights(images, pictures);

	if (
		(images.length === 0 && pictures.length === 0) ||
		nonImageElements.length === 0
	) {
		return;
	}

	if (container.classList.contains("overlay")) {
		applyOverlayHeights(container);
	} else {
		applyStandardHeights(images, pictures, nonImageElements);
	}
}

function applyOverlayHeights(container: HTMLElement): void {
	const allChildren = Array.from(container.children);

	for (let i = 0; i < allChildren.length; i++) {
		const child = allChildren[i];
		if (!isImageElement(child) && !isPictureElement(child)) continue;

		let correspondingDiv: HTMLElement | null = null;
		for (let j = i + 1; j < allChildren.length; j++) {
			if (isNonImageElement(allChildren[j])) {
				correspondingDiv = allChildren[j] as HTMLElement;
				break;
			}
		}

		if (!correspondingDiv) continue;

		const divHeight = Math.round(
			correspondingDiv.getBoundingClientRect().height,
		);
		if (divHeight > 0) {
			applyHeights(
				isImageElement(child) ? [child] : [],
				isPictureElement(child) ? [child] : [],
				divHeight,
			);
		}
	}
}

function applyStandardHeights(
	images: HTMLImageElement[],
	pictures: HTMLPictureElement[],
	nonImageElements: HTMLElement[],
): void {
	let maxContentHeight = 0;
	for (const element of nonImageElements) {
		maxContentHeight = Math.max(
			maxContentHeight,
			element.getBoundingClientRect().height,
		);
	}

	if (maxContentHeight > 0) {
		applyHeights(images, pictures, Math.round(maxContentHeight));
	}
}

function resetElementHeights(
	images: HTMLImageElement[],
	pictures: HTMLPictureElement[],
): void {
	for (const img of images) {
		img.style.height = "";
		img.style.minHeight = "";
	}

	for (const picture of pictures) {
		picture.style.height = "";
		picture.style.minHeight = "";
		const innerImg = picture.querySelector<HTMLImageElement>("img");
		if (innerImg) {
			innerImg.style.height = "";
			innerImg.style.minHeight = "";
		}
	}
}

function applyHeights(
	images: HTMLImageElement[],
	pictures: HTMLPictureElement[],
	height: number,
): void {
	const heightPx = `${height}px`;

	for (const img of images) {
		img.style.height = heightPx;
		img.style.minHeight = heightPx;
	}

	for (const picture of pictures) {
		picture.style.height = heightPx;
		picture.style.minHeight = heightPx;
		const innerImg = picture.querySelector<HTMLImageElement>("img");
		if (innerImg) {
			innerImg.style.height = heightPx;
			innerImg.style.minHeight = heightPx;
			innerImg.style.objectFit = "cover";
		}
	}
}

function debounce<T extends (...args: any[]) => void>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

function clearCache(): void {
	containerCache.clear();
}

function setupImageLoadListeners(): void {
	const images = document.querySelectorAll<HTMLImageElement>(
		".full-width-split-screen img",
	);
	const pictures = document.querySelectorAll<HTMLPictureElement>(
		".full-width-split-screen picture",
	);

	for (const img of images) {
		if (img.complete) {
			matchSplitScreenImageHeights();
		} else {
			img.addEventListener("load", matchSplitScreenImageHeights);
			img.addEventListener("error", matchSplitScreenImageHeights);
		}
	}

	for (const picture of pictures) {
		const innerImg = picture.querySelector<HTMLImageElement>("img");
		if (innerImg) {
			if (innerImg.complete) {
				matchSplitScreenImageHeights();
			} else {
				innerImg.addEventListener("load", matchSplitScreenImageHeights);
				innerImg.addEventListener("error", matchSplitScreenImageHeights);
			}
		}
	}
}

function initSplitScreenHeightMatcher(): void {
	if (isInitialized) {
		console.warn("Split screen height matcher already initialized");
		return;
	}

	try {
		if (document.readyState === "loading") {
			document.addEventListener(
				"DOMContentLoaded",
				matchSplitScreenImageHeights,
			);
		} else {
			matchSplitScreenImageHeights();
		}

		if (document.readyState === "complete") {
			matchSplitScreenImageHeights();
		} else {
			window.addEventListener("load", matchSplitScreenImageHeights);
		}

		document.addEventListener("astro:page-load", () => {
			clearCache();
			matchSplitScreenImageHeights();
		});

		document.addEventListener("astro:after-swap", () => {
			clearCache();
			matchSplitScreenImageHeights();
		});

		debouncedResize = debounce(
			matchSplitScreenImageHeights,
			RESIZE_DEBOUNCE_DELAY,
		);
		window.addEventListener("resize", debouncedResize);

		setupImageLoadListeners();

		isInitialized = true;
	} catch (error) {
		console.error("Failed to initialize split screen height matcher:", error);
	}
}

initSplitScreenHeightMatcher();
