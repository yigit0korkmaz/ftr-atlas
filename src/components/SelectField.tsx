import * as Select from '@radix-ui/react-select';
import {Check,ChevronDown,ChevronUp} from 'lucide-react';
import {Icon} from './ui';

export function SelectField({label,value,onChange,options,icon='sliders'}:{label:string;value:string;onChange:(value:string)=>void;options:{value:string;label:string}[];icon?:string}){
  return <div className="filter-select"><span className="filter-select-label">{label}</span><Select.Root value={value} onValueChange={onChange}><Select.Trigger className="filter-select-trigger" aria-label={label}><Icon name={icon} size={20}/><Select.Value/><Select.Icon className="filter-select-chevron"><ChevronDown size={19}/></Select.Icon></Select.Trigger><Select.Portal><Select.Content className="filter-select-content" position="popper" sideOffset={7} collisionPadding={12}><Select.ScrollUpButton className="filter-select-scroll"><ChevronUp size={18}/></Select.ScrollUpButton><Select.Viewport className="filter-select-viewport">{options.map(o=><Select.Item className="filter-select-item" key={o.value} value={o.value}><Select.ItemText>{o.label}</Select.ItemText><Select.ItemIndicator><Check size={19}/></Select.ItemIndicator></Select.Item>)}</Select.Viewport><Select.ScrollDownButton className="filter-select-scroll"><ChevronDown size={18}/></Select.ScrollDownButton></Select.Content></Select.Portal></Select.Root></div>;
}
