import * as React from "react";
import {DatePicker, Loader} from "rsuite";
import {Car, CarEvents, User} from "./types";
import {ThunkDispatch} from "@reduxjs/toolkit";
import {connect} from "react-redux";
import {getThreeDays} from "./redux/reducers/requestSlice";
import moment from "moment";

interface CalendarProps {
    threeDays: CarEvents | null;
    user: User;
    cars: Car[];
    status: string;
    error: string;
    interval: number;
    dispatch: ThunkDispatch<any, any, any>;
}

interface CalendarState {
    startDate: Date;
}

export class Calendar extends React.Component<CalendarProps, CalendarState> {
    constructor(props) {
        super(props);
        this.state = {
            startDate: new Date()
        }
        this.handleStartChange = this.handleStartChange.bind(this);
        this.props.dispatch(getThreeDays({start: moment(this.state.startDate).startOf("day").format(), interval: this.props.interval}));
    }

    handleStartChange(event) {
        let newDate = new Date();
        if (event) {
            newDate = new Date(event);
        }
        this.setState({
            startDate: newDate
        });
        this.props.dispatch(getThreeDays({start: this.state.startDate.toString(), interval: this.props.interval}));
    }

    render() {
        let events;
        if ((this.props.status !== "loading") && (this.props.threeDays !== null)) {
            let time_labels = this.makeTimeIntervals(this.props.threeDays.interval);
            let row_data = [] as string[][];
            for (let i in this.props.threeDays.busy_segments) {
                row_data.push(this.props.threeDays.busy_segments[i].split(''));
            }
            console.log(row_data);
            let car_labels = [] as string[];
            car_labels.push(...this.props.threeDays.cars);
            console.log(car_labels);
            console.log(time_labels);
            events = this.makeRotatedTable(time_labels, car_labels, row_data, "calendar-table");
        } else {
            events = <Loader size="lg" center content="Loading" vertical/>
        }
        return (
            <div className="calendar">
                <p>Display car bookings for the three days starting from:</p>
                <div className="date-select">
                    <DatePicker
                        className="selector"
                        size="sm"
                        format="YYYY-MM-DD"
                        onChange={this.handleStartChange}
                        value={this.state.startDate}
                    />
                </div>
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
                <th className={`${class_name}`} key="head">&nbsp;</th>
                {column_names.map(x => {return (<th className={`${class_name}`} key={x}>{x}</th>)})}
            </tr>;
        let trs = [] as any[];
        for (let i in row_names) {
            let tr = [(<td className={`${class_name}-row-label`} key={row_names[i]}>{row_names[i]}</td>)];
            tr.push(...row_data[i].map(x => {
                if (x === ',') {
                    return (<td className={`${class_name}-blank`}>&nbsp;</td>);
                } else if (x === '<') {
                    return (<td className={`${class_name}-start`}>^</td>);
                } else if (x === '-') {
                    return (<td className={`${class_name}-block`}>|</td>);
                } else if (x === '>') {
                    return (<td className={`${class_name}-end`}>v</td>);
                } else if (x === 'o') {
                    return (<td className={`${class_name}-blip`}>o</td>);
                } else {
                    return (<td className={`${class_name}-blank`}>&nbsp;</td>);
                }
            }));
            trs.push(tr);
        }
        let tbody = trs.map(x => {return (<tr className={class_name}>{x}</tr>)});
        return (
            <div className={class_name}>
                <table className={`${class_name}-header`}>
                    {colgroups}
                    <tbody>{thead}</tbody>
                </table>
                <table className={`${class_name}-body`}>
                    {colgroups}<tbody>{tbody}</tbody>
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
        let count = 0;
        while (count < 3) {
            while (time < day) {
                if (time % hour === 0) {
                    time_labels.push(`${time/hour}:00`);
                } else if (time % quarter === 0) {
                    time_labels.push('-');
                }
                time = time + interval;
            }
            count++;
            time = 0;
        }
        return time_labels;
    }
}

const mapStateToProps = (state) => {
    return {
        threeDays: state.requests.threeDays,
        user: state.user.user,
        cars: state.cars.entries,
        status: state.requests.status,
        error: state.requests.error,
        interval: state.requests.interval
    };
}
export default connect(mapStateToProps)(Calendar)
