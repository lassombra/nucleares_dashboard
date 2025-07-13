import {HSLColor, RGBColor} from "d3-color";

export type LabelValue = {
    label: string;
    color: RGBColor | HSLColor;
};
export type LabelProps = {
    label: string;
    values: LabelValue[];
}

export default function Label(props: LabelProps) {
    return <div>
        <span className="text-4xl font-bold text-gray-400">{props.label}</span>&nbsp;
        {props.values.map((value, index) => (
            <span key={index} className="text-3xl font-bold" style={{color: value.color.toString()}}>
                {value.label}
                {index < props.values.length - 1 ? ', ' : ''}
            </span>
        ))}
    </div>
}