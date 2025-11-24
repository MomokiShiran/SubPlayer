import clamp from 'lodash/clamp';
import DT from 'duration-time-conversion';

export default class Sub {
    constructor(obj) {
        this.start = obj.start;
        this.end = obj.end;
        this.text = obj.text;
        this.text2 = obj.text2;
    }

    get check() {
        return this.startTime >= 0 && this.endTime >= 0 && this.startTime < this.endTime;
    }

    get clone() {
        return new Sub(this);
    }

    get startTime() {
        const time = DT.t2d(this.start);
        // 检查是否为有效数字
        return !isNaN(time) && isFinite(time) ? time : -1;
    }

    set startTime(time) {
        this.start = DT.d2t(clamp(time, 0, Infinity));
    }

    get endTime() {
        const time = DT.t2d(this.end);
        // 检查是否为有效数字
        return !isNaN(time) && isFinite(time) ? time : -1;
    }

    set endTime(time) {
        this.end = DT.d2t(clamp(time, 0, Infinity));
    }

    get duration() {
        return parseFloat((this.endTime - this.startTime).toFixed(3));
    }
}
