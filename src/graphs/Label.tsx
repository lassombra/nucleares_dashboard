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
    return <div className="flex flex-row flex-wrap w-full">
        <span className="text-3xl font-bold text-gray-400 flex">{props.label} </span>
        {props.values.map((value, index) => (
            <span key={index} className="text-3xl font-bold text-nowrap flex" style={{color: value.color.toString()}}>
                {value.label}
                {index < props.values.length - 1 ? ', ' : ''}
            </span>
        ))}
    </div>
}