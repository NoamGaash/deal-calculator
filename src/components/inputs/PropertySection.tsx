import { useTranslation } from 'react-i18next';
import { SectionCard } from '../ui/SectionCard';
import { InputField } from '../ui/InputField';
import { SelectField } from '../ui/SelectField';
import type { PropertyInputs, PropertyType } from '../../types';

interface Props {
  data: PropertyInputs;
  onChange: (data: PropertyInputs) => void;
}

export function PropertySection({ data, onChange }: Props) {
  const { t } = useTranslation();
  const update = <K extends keyof PropertyInputs>(key: K, value: PropertyInputs[K]) =>
    onChange({ ...data, [key]: value });

  const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
    { value: 'additional', label: t('property.typeAdditional') },
    { value: 'first', label: t('property.typeFirst') },
  ];

  return (
    <SectionCard title={t('property.title')}>
      <div className="grid grid-cols-2 gap-3">
        <InputField
          label={t('property.price')}
          value={data.price}
          onChange={v => update('price', v)}
          prefix="₪"
          min={0}
          step={10000}
          tooltip={t('property.priceTooltip')}
          className="col-span-2"
        />
        <InputField
          label={t('property.equity')}
          value={data.equity}
          onChange={v => update('equity', v)}
          prefix="₪"
          min={0}
          step={10000}
          tooltip={t('property.equityTooltip')}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-400">{t('property.leverage')}</label>
          <div className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1.5 text-sm text-gray-300">
            {data.price > 0 ? `${(((data.price - data.equity) / data.price) * 100).toFixed(1)}% LTV` : '—'}
          </div>
        </div>
        <InputField
          label={t('property.appreciation')}
          value={data.appreciationRate}
          onChange={v => update('appreciationRate', v)}
          suffix="%"
          min={-5}
          max={20}
          step={0.5}
        />
        <InputField
          label={t('property.holdingPeriod')}
          value={data.holdingPeriodYears}
          onChange={v => update('holdingPeriodYears', Math.round(v))}
          suffix={t('property.years')}
          min={1}
          max={40}
          step={1}
        />
        <SelectField
          label={t('property.propertyType')}
          value={data.propertyType}
          options={PROPERTY_TYPE_OPTIONS}
          onChange={v => update('propertyType', v)}
          className="col-span-2"
        />
        <InputField
          label={t('property.alternativeYield')}
          value={data.alternativeYieldPct}
          onChange={v => update('alternativeYieldPct', v)}
          suffix="%"
          min={0}
          max={30}
          step={0.5}
          tooltip={t('property.alternativeYieldTooltip')}
          className="col-span-2"
        />
      </div>
    </SectionCard>
  );
}
