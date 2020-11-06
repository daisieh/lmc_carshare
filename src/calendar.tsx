import * as React from "react";

interface CalendarProps {
    // calendars: string[];
}

export class Calendar extends React.Component<CalendarProps, {}> {
    render() {
        let cal_src = "https://calendar.google.com/calendar/embed?amp;wkst=1&amp;bgcolor=%23ffffff&amp;ctz=America%2FVancouver&amp;"
            + "color=%237986CB&amp;color=%23E67C73&amp;color=%23A79B8E&amp;color=%23EF6C00";
        // for (let i in this.props.calendars) {
        //     cal_src += "&amp;src=" + this.props.calendars[i];
        // }
        return (
            <div className="calendar">
                <iframe title="all_cars_calendar"
                        src={cal_src}
                        frameBorder="0" scrolling="no"/>
            </div>
        );
    }
}
