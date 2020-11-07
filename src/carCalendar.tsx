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
        let events;
        if (!this.state.isLoading && this.state.car_events) {
            let hours = ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
            let row_data = [] as string[][];
            for (let i in this.state.car_events.busy_segments) {
                row_data.push(this.state.car_events.busy_segments[i].replace(/1/g,'X').replace(/0/g,'-').split(''));
            }
            events = this.makeTable(hours, this.state.car_events.cars, row_data, "calendar-table");
        } else {
            events = <Loader size="lg" center content="Loading" vertical/>
        }
        return (
            <div className="calendar">
                {events}
            </div>
        );
    }

    makeTable (column_names :string[], row_names :string[], row_data :any[], class_name :string) {
        let thead = <tr className={`${class_name}-col-label`}><th/>{column_names.map(x => {return (<th>{x}</th>)})}</tr>;
        let trs = [] as any[];
        for (let i in row_names) {
            let tr = [(<td className={`${class_name}-row-label`}>{row_names[i]}</td>)];
            tr.push(...row_data[i].map(x => {return (<td className={class_name}>{x}</td>)}));
            trs.push(tr);
        }
        let tbody = trs.map(x => {return (<tr className={class_name}>{x}</tr>)});
        return (<table className={class_name}><thead className={class_name}>{thead}</thead><tbody className={class_name}>{tbody}</tbody></table>);
    }
    //
    // makeRotatedTable (column_names :string[], row_names :string[], row_data :any[], class_name :string) {
    //     let thead = <tr className={`${class_name}-col-label`}><th/>{row_names.map(x => {return (<th>{x}</th>)})}</tr>;
    //     let trs = [] as any[];
    //     for (let i in column_names) {
    //         let tr = [(<td className={`${class_name}-row-label`}>{column_names[i]}</td>)];
    //         let row = row_data[i];
    //         let tds = [] as String[];
    //         for (let x=0; x < row.length; x++) {
    //             let busy = (row[x] === '1') ? "X" : "-";
    //             tds.push(busy);
    //         }
    //         tr.push(...tds.map(x => {return (<td className={class_name}>{x}</td>)}));
    //         trs.push(tr);
    //     }
    //     let tbody = trs.map(x => {return (<tr className={class_name}>{x}</tr>)});
    //     return (<table className={class_name}><thead className={class_name}>{thead}</thead><tbody className={class_name}>{tbody}</tbody></table>);
    // }
}
