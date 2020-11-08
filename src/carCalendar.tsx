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
            .run("three_day_array", {start: this.state.startTime, interval: '900'})
            .then(response => { this.setState({car_events: response.results[0] as CarEvents, isLoading: false})})
            .catch(response => {
                this.setState( {errorMessage: response.toString(), isLoading: false});
            });
    }

    render() {
        let events;
        if (!this.state.isLoading && this.state.car_events) {
            let time_labels = this.makeTimeIntervals(this.state.car_events.interval);
            let row_data = [] as string[][];
            for (let i in this.state.car_events.busy_segments) {
                row_data.push(this.state.car_events.busy_segments[i].split(''));
            }
            console.log(row_data);
            let car_labels = [] as string[];
            for (let i=0; i<3; i++) {
                car_labels.push(...this.state.car_events.cars);
            }
            console.log(car_labels);
            console.log(time_labels);
            events = this.makeRotatedTable(time_labels, car_labels, row_data, "calendar-table");
        } else {
            events = <Loader size="lg" center content="Loading" vertical/>
        }
        return (
            <div className="calendar">
                {events}
            </div>
        );
    }

    makeTable (column_names :string[], row_names :string[], row_data :string[][], class_name :string) {
        console.log(row_names);
        let colgroups = <colgroup className={`${class_name}`}>
            <col span={1} className={`${class_name}-col-name-span`}/>
            <col span={column_names.length} className={`${class_name}-col-span`}/>
            </colgroup>
        let thead =
            <tr className={`${class_name}`}>
                <th className={`${class_name}`}>&nbsp;</th>
                {column_names.map(x => {return (<th className={`${class_name}`}>{x}</th>)})}
            </tr>;
        let trs = [] as any[];
        for (let d=0; d<3; d++) {
            for (let i in row_names) {
                let tr = [(<td className={`${class_name}-row-label`}>{row_names[i]}</td>)];
                tr.push(...row_data[i].map(x => {
                    return (<td className={class_name}>{x}</td>)
                }));
                trs.push(tr);
            }
        }
        let tbody = trs.map(x => {return (<tr className={class_name}>{x}</tr>)});
        return (
            <div className={class_name}>
                <table className={`${class_name}-header`}>
                    {colgroups}
                    {thead}
                </table>
                <table className={`${class_name}-body`}>
                    {colgroups}{tbody}
                </table>
            </div>
        );
    }
    makeRotatedTable (column_names :string[], row_names :string[], row_data :string[][], class_name :string) {
        let new_row_data = [] as string[][];
        console.log(column_names);
        for (let ci=0; ci<(row_data[0].length); ci++) {
            let new_row = [] as string[];
            for (let ri=0; ri<row_data.length; ri++) {
                new_row.push(row_data[ri][ci]);
            }
            new_row_data.push(new_row);
        }
        console.log(new_row_data);
        return this.makeTable(row_names, column_names, new_row_data, class_name);
    }

    makeTimeIntervals (interval :number) {
        let day = 86400;
        let hour = 3600;
        let quarter = 900;

        let time = 0;
        let time_labels = [] as string[];
        while (time < day) {
            if (time % hour === 0) {
                time_labels.push(`${time/hour}:00`);
            } else if (time % quarter === 0) {
                time_labels.push('-');
            }
            time = time + interval;
        }
        return time_labels;
    }
}
