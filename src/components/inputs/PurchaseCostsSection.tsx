import { useTranslation } from 'react-i18next';
import { SectionCard } from '../ui/SectionCard';
import { InputField } from '../ui/InputField';
import { CostInput } from '../ui/CostInput';
import type { PurchaseCosts, PropertyInputs } from '../../types';
import { resolveCost } from '../../types';
import { calcPurchaseTax } from '../../constants/purchaseTax';
import { fmtILS } from '../../utils/formatters';

interface Props {
  data: PurchaseCosts;
  property: PropertyInputs;
  onChange: (data: PurchaseCosts) => void;
}

export function PurchaseCostsSection({ data, property, onChange }: Props) {
  const { t } = useTranslation();
  const update = <K extends keyof PurchaseCosts>(key: K, value: PurchaseCosts[K]) =>
    onChange({ ...data, [key]: value });

  const tax = calcPurchaseTax(property.price, property.propertyType);
  const brokerFee = resolveCost(data.brokerCommission, property.price);
  const attorneyFee = resolveCost(data.attorney, property.price);
  const total = tax + brokerFee + attorneyFee + data.mortgageConsultingFee + data.appraisalFee;

  return (
    <SectionCard title={t('purchaseCosts.title')}>
      <div className="grid grid-cols-2 gap-3">
        <CostInput
          label={t('purchaseCosts.brokerCommission')}
          value={data.brokerCommission}
          onChange={v => update('brokerCommission', v)}
          tooltip={brokerFee > 0 ? fmtILS(brokerFee) : undefined}
        />
        <CostInput
          label={t('purchaseCosts.attorney')}
          value={data.attorney}
          onChange={v => update('attorney', v)}
          tooltip={attorneyFee > 0 ? fmtILS(attorneyFee) : undefined}
        />
        <InputField
          label={t('purchaseCosts.mortgageConsulting')}
          value={data.mortgageConsultingFee}
          onChange={v => update('mortgageConsultingFee', v)}
          prefix="₪"
          min={0} step={500}
        />
        <InputField
          label={t('purchaseCosts.appraisal')}
          value={data.appraisalFee}
          onChange={v => update('appraisalFee', v)}
          prefix="₪"
          min={0} step={500}
        />

        <div className="col-span-2 mt-1 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm bg-gray-700 border border-gray-600 rounded-md px-3 py-2">
            <span className="text-gray-400">{t('purchaseCosts.purchaseTax')}</span>
            <span className="text-yellow-400 font-semibold">{fmtILS(tax)}</span>
          </div>
          <div className="flex items-center justify-between text-sm bg-gray-700 border border-gray-600 rounded-md px-3 py-2">
            <span className="text-gray-300 font-medium">{t('purchaseCosts.total')}</span>
            <span className="text-white font-bold">{fmtILS(total)}</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
