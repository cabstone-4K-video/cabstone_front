import $ from 'jquery';

interface AnimateOptions {
    duration?: number;
    easing?: string;
    complete?: () => void;
}

interface LayoutOptions {
    maxRatio?: number;
    minRatio?: number;
    fixedRatio?: boolean;
    animate?: boolean | AnimateOptions;
    bigClass?: string;
    bigPercentage?: number;
    bigFixedRatio?: boolean;
    bigMaxRatio?: number;
    bigMinRatio?: number;
    bigFirst?: boolean;
}

class OpenViduLayout {
    layoutContainer: JQuery<HTMLElement>;
    opts: LayoutOptions;

    constructor() {
        this.layoutContainer = $();
        this.opts = {};
    }

    fixAspectRatio(elem: HTMLElement, width: number): void {
        const sub = elem.querySelector('.OT_root');
        if (sub) {
            const oldWidth = (sub as HTMLElement).style.width;
            (sub as HTMLElement).style.width = width + 'px';
            (sub as HTMLElement).style.width = oldWidth || '';
        }
    }

    positionElement(
        elem: HTMLElement,
        x: number,
        y: number,
        width: number,
        height: number,
        animate?: boolean | AnimateOptions
    ): void {
        const targetPosition = {
            left: x + 'px',
            top: y + 'px',
            width: width + 'px',
            height: height + 'px',
        };

        this.fixAspectRatio(elem, width);

        if (animate && $) {
            if (typeof animate === 'object') {
                $(elem).stop();
                $(elem).animate(targetPosition, animate.duration || 200, animate.easing || 'swing', () => {
                    this.fixAspectRatio(elem, width);
                    if (animate.complete) {
                        animate.complete.call(this);
                    }
                });
            } else {
                $(elem).stop();
                $(elem).animate(targetPosition, 200, 'swing', () => {
                    this.fixAspectRatio(elem, width);
                });
            }
        } else {
            $(elem).css(targetPosition);
        }
        this.fixAspectRatio(elem, width);
    }

    getVideoRatio(elem: HTMLElement | null): number {
        if (!elem) {
            return 3 / 4;
        }
        const video = elem.querySelector('video');
        if (video && video.videoHeight && video.videoWidth) {
            return video.videoHeight / video.videoWidth;
        } else if ((elem as HTMLVideoElement).videoHeight && (elem as HTMLVideoElement).videoWidth) {
            return (elem as HTMLVideoElement).videoHeight / (elem as HTMLVideoElement).videoWidth;
        }
        return 3 / 4;
    }

    getCSSNumber(elem: HTMLElement, prop: string): number {
        const cssStr = $(elem).css(prop);
        return cssStr ? parseInt(cssStr, 10) : 0;
    }

    cheapUUID(): string {
        return (Math.random() * 100000000).toFixed(0);
    }

    getHeight(elem: HTMLElement): number {
        const heightStr = $(elem).css('height');
        return heightStr ? parseInt(heightStr, 10) : 0;
    }

    getWidth(elem: HTMLElement): number {
        const widthStr = $(elem).css('width');
        return widthStr ? parseInt(widthStr, 10) : 0;
    }

    getBestDimensions(
			minR: number,
			maxR: number,
			count: number,
			WIDTH: number,
			HEIGHT: number,
			targetHeight: number
	) {
			let maxArea: number | undefined,
					targetCols: number | undefined,
					targetRows: number | undefined,
					targetWidth: number | undefined,
					tWidth: number,
					tHeight: number,
					tRatio: number;
	
			for (let i = 1; i <= count; i++) {
					const colsAux = i;
					const rowsAux = Math.ceil(count / colsAux);
	
					tHeight = Math.floor(HEIGHT / rowsAux);
					tWidth = Math.floor(WIDTH / colsAux);
	
					tRatio = tHeight / tWidth;
					if (tRatio > maxR) {
							tRatio = maxR;
							tHeight = tWidth * tRatio;
					} else if (tRatio < minR) {
							tRatio = minR;
							tWidth = tHeight / tRatio;
					}
	
					const area = tWidth * tHeight * count;
	
					if (maxArea === undefined || area > maxArea) {
							maxArea = area;
							targetHeight = tHeight;
							targetWidth = tWidth;
							targetCols = colsAux;
							targetRows = rowsAux;
					}
			}
			const finalTargetWidth = targetWidth !== undefined ? targetWidth : WIDTH;
			const finalTargetHeight = targetHeight !== undefined ? targetHeight : HEIGHT;
			return {
					maxArea: maxArea,
					targetCols: targetCols,
					targetRows: targetRows,
					targetHeight: finalTargetHeight,
					targetWidth: finalTargetWidth,
					ratio: finalTargetHeight / finalTargetWidth,
			};
	}
	

    arrange(
        children: HTMLElement[],
        WIDTH: number,
        HEIGHT: number,
        offsetLeft: number,
        offsetTop: number,
        fixedRatio: boolean,
        minRatio: number,
        maxRatio: number,
        animate?: boolean | AnimateOptions
    ): void {
        let targetHeight: number = 0;
        const count = children.length;
        let dimensions: any;

        if (!fixedRatio) {
            dimensions = this.getBestDimensions(minRatio, maxRatio, count, WIDTH, HEIGHT, targetHeight);
        } else {
            const ratio = this.getVideoRatio(children.length > 0 ? children[0] : null);
            dimensions = this.getBestDimensions(ratio, ratio, count, WIDTH, HEIGHT, targetHeight);
        }

        let x = 0,
            y = 0;
        const rows: any[] = [];
        let row: any;

        for (let i = 0; i < children.length; i++) {
            if (i % dimensions.targetCols === 0) {
                row = {
                    children: [],
                    width: 0,
                    height: 0,
                };
                rows.push(row);
            }
            const elem = children[i];
            row.children.push(elem);
            let targetWidth = dimensions.targetWidth;
            targetHeight = dimensions.targetHeight;

            if (fixedRatio) {
                targetWidth = targetHeight / this.getVideoRatio(elem);
            }
            row.width += targetWidth;
            row.height = targetHeight;
        }

        let totalRowHeight = 0;
        let remainingShortRows = 0;
        for (let i = 0; i < rows.length; i++) {
            row = rows[i];
            if (row.width > WIDTH) {
                row.height = Math.floor(row.height * (WIDTH / row.width));
                row.width = WIDTH;
            } else if (row.width < WIDTH) {
                remainingShortRows += 1;
            }
            totalRowHeight += row.height;
        }
        if (totalRowHeight < HEIGHT && remainingShortRows > 0) {
            let remainingHeightDiff = HEIGHT - totalRowHeight;
            totalRowHeight = 0;
            for (let i = 0; i < rows.length; i++) {
                row = rows[i];
                if (row.width < WIDTH) {
                    let extraHeight = remainingHeightDiff / remainingShortRows;
                    if (extraHeight / row.height > (WIDTH - row.width) / row.width) {
                        extraHeight = Math.floor((WIDTH - row.width) / row.width * row.height);
                    }
                    row.width += Math.floor(extraHeight / row.height * row.width);
                    row.height += extraHeight;
                    remainingHeightDiff -= extraHeight;
                    remainingShortRows -= 1;
                }
                totalRowHeight += row.height;
            }
        }

        y = (HEIGHT - totalRowHeight) / 2;

        for (let i = 0; i < rows.length; i++) {
            row = rows[i];
            const rowMarginLeft = (WIDTH - row.width) / 2;
            x = rowMarginLeft;
            for (let j = 0; j < row.children.length; j++) {
                const elem = row.children[j];

                let targetWidth = dimensions.targetWidth;
                targetHeight = row.height;
                if (fixedRatio) {
                    targetWidth = Math.floor(targetHeight / this.getVideoRatio(elem));
                }
                elem.style.position = 'absolute';

                const actualWidth =
                    targetWidth -
                    this.getCSSNumber(elem, 'paddingLeft') -
                    this.getCSSNumber(elem, 'paddingRight') -
                    this.getCSSNumber(elem, 'marginLeft') -
                    this.getCSSNumber(elem, 'marginRight') -
                    this.getCSSNumber(elem, 'borderLeft') -
                    this.getCSSNumber(elem, 'borderRight');

                const actualHeight =
                    targetHeight -
                    this.getCSSNumber(elem, 'paddingTop') -
                    this.getCSSNumber(elem, 'paddingBottom') -
                    this.getCSSNumber(elem, 'marginTop') -
                    this.getCSSNumber(elem, 'marginBottom') -
                    this.getCSSNumber(elem, 'borderTop') -
                    this.getCSSNumber(elem, 'borderBottom');

                this.positionElement(elem, x + offsetLeft, y + offsetTop, actualWidth, actualHeight, animate);
                x += targetWidth;
            }
            y += targetHeight;
        }
    }

    filterDisplayNone(element: HTMLElement): boolean {
        return element.style.display !== 'none';
    }

    updateLayout(): void {
        if (this.layoutContainer.css('display') === 'none') {
            return;
        }
        let id = this.layoutContainer.attr('id');
        if (!id) {
            id = 'OT_' + this.cheapUUID();
            this.layoutContainer.attr('id', id);
        }

        const HEIGHT =
            this.getHeight(this.layoutContainer[0]) -
            this.getCSSNumber(this.layoutContainer[0], 'borderTop') -
            this.getCSSNumber(this.layoutContainer[0], 'borderBottom');
        const WIDTH =
            this.getWidth(this.layoutContainer[0]) -
            this.getCSSNumber(this.layoutContainer[0], 'borderLeft') -
            this.getCSSNumber(this.layoutContainer[0], 'borderRight');

        const availableRatio = HEIGHT / WIDTH;

        let offsetLeft = 0;
        let offsetTop = 0;
        let bigOffsetTop = 0;
        let bigOffsetLeft = 0;

        const bigOnes = Array.prototype.filter.call(
            this.layoutContainer[0].querySelectorAll('#' + id + '>.' + this.opts.bigClass),
            this.filterDisplayNone
        );
        const smallOnes = Array.prototype.filter.call(
            this.layoutContainer[0].querySelectorAll('#' + id + '>*:not(.' + this.opts.bigClass + ')'),
            this.filterDisplayNone
        );

        if (bigOnes.length > 0 && smallOnes.length > 0) {
            let bigWidth, bigHeight;

            if (availableRatio > this.getVideoRatio(bigOnes[0])) {
                bigWidth = WIDTH;
                bigHeight = Math.floor(HEIGHT * (this.opts.bigPercentage || 0.8));
                offsetTop = bigHeight;
                bigOffsetTop = HEIGHT - offsetTop;
            } else {
                bigHeight = HEIGHT;
                bigWidth = Math.floor(WIDTH * (this.opts.bigPercentage || 0.8));
                offsetLeft = bigWidth;
                bigOffsetLeft = WIDTH - offsetLeft;
            }
            if (this.opts.bigFirst) {
                this.arrange(
                    bigOnes,
                    bigWidth,
                    bigHeight,
                    0,
                    0,
                    this.opts.bigFixedRatio || false,
                    this.opts.bigMinRatio || 9 / 16,
                    this.opts.bigMaxRatio || 3 / 2,
                    this.opts.animate
                );
                this.arrange(
                    smallOnes,
                    WIDTH - offsetLeft,
                    HEIGHT - offsetTop,
                    offsetLeft,
                    offsetTop,
                    this.opts.fixedRatio || false,
                    this.opts.minRatio || 9 / 16,
                    this.opts.maxRatio || 3 / 2,
                    this.opts.animate
                );
            } else {
                this.arrange(
                    smallOnes,
                    WIDTH - offsetLeft,
                    HEIGHT - offsetTop,
                    0,
                    0,
                    this.opts.fixedRatio || false,
                    this.opts.minRatio || 9 / 16,
                    this.opts.maxRatio || 3 / 2,
                    this.opts.animate
                );
                this.arrange(
                    bigOnes,
                    bigWidth,
                    bigHeight,
                    bigOffsetLeft,
                    bigOffsetTop,
                    this.opts.bigFixedRatio || false,
                    this.opts.bigMinRatio || 9 / 16,
                    this.opts.bigMaxRatio || 3 / 2,
                    this.opts.animate
                );
            }
        } else if (bigOnes.length > 0 && smallOnes.length === 0) {
            this.arrange(
                bigOnes,
                WIDTH,
                HEIGHT,
                0,
                0,
                this.opts.bigFixedRatio || false,
                this.opts.bigMinRatio || 9 / 16,
                this.opts.bigMaxRatio || 3 / 2,
                this.opts.animate
            );
        } else {
            this.arrange(
                smallOnes,
                WIDTH - offsetLeft,
                HEIGHT - offsetTop,
                offsetLeft,
                offsetTop,
                this.opts.fixedRatio || false,
                this.opts.minRatio || 9 / 16,
                this.opts.maxRatio || 3 / 2,
                this.opts.animate
            );
        }
    }

    initLayoutContainer(container: string | JQuery<HTMLElement>, opts: LayoutOptions): void {
        this.opts = {
            maxRatio: opts.maxRatio != null ? opts.maxRatio : 3 / 2,
            minRatio: opts.minRatio != null ? opts.minRatio : 9 / 16,
            fixedRatio: opts.fixedRatio != null ? opts.fixedRatio : false,
            animate: opts.animate != null ? opts.animate : false,
            bigClass: opts.bigClass != null ? opts.bigClass : 'OT_big',
            bigPercentage: opts.bigPercentage != null ? opts.bigPercentage : 0.8,
            bigFixedRatio: opts.bigFixedRatio != null ? opts.bigFixedRatio : false,
            bigMaxRatio: opts.bigMaxRatio != null ? opts.bigMaxRatio : 3 / 2,
            bigMinRatio: opts.bigMinRatio != null ? opts.bigMinRatio : 9 / 16,
            bigFirst: opts.bigFirst != null ? opts.bigFirst : true,
        };
        this.layoutContainer = typeof container === 'string' ? $(container) : container;
    }

    setLayoutOptions(options: LayoutOptions): void {
        this.opts = options;
    }
}

export default OpenViduLayout;
