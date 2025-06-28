import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface Context {
    id: string;
    ignoreTelemetry?: {
        when: {
            interact?: RegExp;
            impression?: RegExp;
        };
    };
}

@Injectable({
    providedIn: 'root'
})
export class SbProgressLoader {
    private modal?: HTMLIonModalElement;
    private progress: BehaviorSubject<number> = new BehaviorSubject(0);

    readonly contexts = new Map<string, Context>();

    constructor() {}

    async show(context: Context = {id: 'DEFAULT'}) {
        this.contexts.set(context.id, context);

        if (this.modal) {
            return;
        }

        this.progress.next(0);
        setTimeout(() => {
            this.hide(context);
        }, 30 * 1000);
    }

    updateProgress(progress: number) {
        if (!this.modal) {
            return;
        }
        this.progress.next(progress);
    }

    async hide(context: Context = {id: 'DEFAULT'}) {
        if (!this.contexts.has(context.id)) {
            return;
        }

        this.contexts.delete(context.id);

        if (!this.modal || this.contexts.size) {
            return;
        }

        this.progress.next(100);

        setTimeout(() => {
            this.modal.dismiss();
            this.modal = undefined;
        }, 500);
    }
}
