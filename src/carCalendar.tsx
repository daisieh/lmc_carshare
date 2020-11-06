import * as React from "react";
import moment from "moment";
import {Transposit} from "transposit";
// import {Table} from "rsuite";
import {Car} from "./carbooker";
import {Loader} from "rsuite";
// const { Column, HeaderCell, Cell } = Table;

const transposit = new Transposit(
    "https://lmc-carshare-89gbj.transposit.io"
);

interface CarEvents {
    start: string;
    end: string;
    cars: string[];
    interval: number;
    busy_segments: string[];
}

// interface Event {
//     start: string;
//     end: string;
// }

interface CarCalendarProps {
    cars: Car[];
}

interface CarCalendarState {
    car_events: CarEvents | null;
    isLoading: boolean;
    errorMessage: string;
    startTime: string;
    endTime: string;
}

export class CarCalendar extends React.Component<CarCalendarProps, CarCalendarState> {
    constructor(props) {
        super(props);
        this.state = {
            car_events: null,
            isLoading: true,
            startTime: moment(`${moment().format('YYYY-MM-DD')}T00:00:00-0800`).format(),
            endTime: moment().add(3, "days").format(),
            errorMessage: ""
        };
        this.updateEvents = this.updateEvents.bind(this);
        // this.handleReminder = this.handleReminder.bind(this);

        this.updateEvents();
    }

    async updateEvents() {
        this.setState({isLoading: true});
        await transposit
            .run("car_day_array", {start: this.state.startTime, interval: '3600'})
            .then(response => { this.setState({car_events: response.results[0] as CarEvents, isLoading: false})})
            .catch(response => {
                this.setState( {errorMessage: response.toString(), isLoading: false});
            });
    }

    render() {
        let events = [] as any[];
        if (!this.state.isLoading && this.state.car_events) {
            let trs;
            for (let i in this.state.car_events.cars) {
                trs = [(<td>{this.state.car_events.cars[i]}</td>)];
                let busy_seg = `${this.state.car_events.busy_segments[i]}`;
                let hours = [] as String[];
                for (let x=0; x < busy_seg.length; x++) {
                    let busy = (busy_seg[x] === '1') ? "X" : "-";
                    hours.push(busy);
                }
                trs.push(...hours.map(x => {return (<td>{x}</td>)}));
                events.push(trs);
            }
            return (
                <div className="calendar">
                    {this.state.car_events.start}
                    <table className="car_busy_calendar">{events.map(x => {return (<tr>{x}</tr>)})}</table>
                </div>
            );
        } else {
            return (
                <div className="calendar">
                    <Loader size="lg" center content="Loading" vertical/>
                </div>
            );
        }
    }
}
