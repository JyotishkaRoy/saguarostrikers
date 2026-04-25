import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { Send, CheckCircle, Rocket } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import toast from 'react-hot-toast';
import type { Mission } from '@/types';

interface JoinMissionFormData {
  // Student Details
  studentFirstName: string;
  studentMiddleName?: string;
  studentLastName: string;
  studentDob: string;
  schoolName: string;
  grade: string;
  studentAddressLine1: string;
  studentAddressLine2?: string;
  studentCity: string;
  studentState: string;
  studentZip: string;
  studentEmail: string;
  studentPhone?: string;
  studentSlack?: string;
  missionId: string;
  fitReason: string;
  studentSignature: string;
  studentSignatureDate: string;
  
  // Parent Details
  parentFirstName: string;
  parentMiddleName?: string;
  parentLastName: string;
  parentAddressLine1: string;
  parentAddressLine2?: string;
  parentCity: string;
  parentState: string;
  parentZip: string;
  parentEmail: string;
  parentPhone: string;
  parentAlternateEmail?: string;
  
  // Agreements
  agreementFinancial: boolean;
  agreementPhotograph: boolean;
  agreementLiability: boolean;
  parentSignature: string;
  parentSignatureDate: string;
}

const DEFAULT_AGREEMENT_FINANCIAL = 'I understand and agree to the financial obligations associated with participating in this mission.';
const DEFAULT_AGREEMENT_PHOTOGRAPH = 'I consent to the use of photographs and videos of the student for promotional and educational purposes related to Saguaro Strikers activities.';
const DEFAULT_AGREEMENT_LIABILITY = 'I acknowledge and accept the risks associated with rocketry activities and release Saguaro Strikers from liability for any injuries or damages that may occur during mission activities.';

interface JoinMissionAgreements {
  agreementFinancial: string;
  agreementPhotograph: string;
  agreementLiability: string;
}

export default function JoinMission() {
  const [searchParams] = useSearchParams();
  const preselectedMissionId = searchParams.get('missionId');
  const preselectedMissionName = searchParams.get('missionName');
  const preselectedOutreachId = searchParams.get('outreachId');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionsLoaded, setMissionsLoaded] = useState(false);
  const [agreements, setAgreements] = useState<JoinMissionAgreements>({
    agreementFinancial: DEFAULT_AGREEMENT_FINANCIAL,
    agreementPhotograph: DEFAULT_AGREEMENT_PHOTOGRAPH,
    agreementLiability: DEFAULT_AGREEMENT_LIABILITY,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<JoinMissionFormData>();

  useEffect(() => {
    fetchActiveMissions();
    fetchAgreements();
  }, []);

  const isMissionLocked = Boolean(preselectedMissionId || preselectedMissionName);
  const isOutreachJoinFlow = Boolean(preselectedOutreachId);

  const lockedMissionId = useMemo(() => {
    if (preselectedMissionId) return preselectedMissionId;
    if (!preselectedMissionName) return '';
    const normalizedName = preselectedMissionName.trim().toLowerCase();
    const mission = missions.find((x) => x.title.trim().toLowerCase() === normalizedName)
      ?? missions.find((x) => x.title.trim().toLowerCase().includes(normalizedName))
      ?? missions.find((x) => normalizedName.includes(x.title.trim().toLowerCase()));
    return mission?.missionId ?? '';
  }, [preselectedMissionId, preselectedMissionName, missions]);

  const lockedMissionTitle = useMemo(() => {
    if (preselectedMissionName) return preselectedMissionName;
    if (!preselectedMissionId) return '';
    const m = missions.find((x) => x.missionId === preselectedMissionId);
    return m?.title ?? '';
  }, [preselectedMissionName, preselectedMissionId, missions]);

  const fetchAgreements = async () => {
    try {
      const response = await api.get<JoinMissionAgreements>('/public/join-mission-agreements');
      if (response.success && response.data) {
        setAgreements({
          agreementFinancial: response.data.agreementFinancial || DEFAULT_AGREEMENT_FINANCIAL,
          agreementPhotograph: response.data.agreementPhotograph || DEFAULT_AGREEMENT_PHOTOGRAPH,
          agreementLiability: response.data.agreementLiability || DEFAULT_AGREEMENT_LIABILITY,
        });
      }
    } catch {
      // keep defaults
    }
  };

  const fetchActiveMissions = async () => {
    try {
      const response = await api.get<Mission[]>('/public/missions');
      if (response.success && response.data) {
        setMissions(response.data.filter(m => m.status === 'published'));
      }
    } catch (error) {
      console.error('Failed to fetch missions:', error);
    } finally {
      setMissionsLoaded(true);
    }
  };

  useEffect(() => {
    if (!isMissionLocked) return;
    setValue('missionId', lockedMissionId || '');
  }, [isMissionLocked, lockedMissionId, setValue]);

  const onSubmit = async (data: JoinMissionFormData) => {
    setIsSubmitting(true);
    trackEvent('join_mission_submit_attempt', {
      has_preselected_mission: isMissionLocked,
      selected_mission_id: data.missionId || 'none',
    });
    try {
      // Add signature dates
      data.studentSignatureDate = new Date().toISOString();
      data.parentSignatureDate = new Date().toISOString();

      if (isOutreachJoinFlow) {
        const outreachResponse = await api.post('/public/outreach-application', {
          ...data,
          outreachId: preselectedOutreachId,
          outreachEventName: lockedMissionTitle || preselectedMissionName || '',
        });

        if (outreachResponse.success) {
          trackEvent('outreach_join_submit', {
            outreach_id: preselectedOutreachId ?? '',
            outreach_title: lockedMissionTitle || preselectedMissionName || '',
            mission_id: data.missionId || '',
          });
          toast.success('Application submitted successfully! Our outreach team will review it and get back to you soon.');
          setIsSuccess(true);
        } else {
          toast.error(outreachResponse.message || 'Failed to submit outreach application.');
        }
      } else {
        const response = await api.post('/public/join-mission', data);
        
        if (response.success) {
          const app = response.data as { applicationId?: string } | undefined;
          const selectedMission = missions.find((m) => m.missionId === data.missionId);
          trackEvent('join_mission_submit', {
            application_id: app?.applicationId ?? '',
            mission_id: data.missionId || '',
            mission_title: selectedMission?.title ?? '',
            has_preselected_mission: isMissionLocked,
          });
          toast.success('Application submitted successfully! Check your email for confirmation.');
          setIsSuccess(true);
        }
      }
    } catch (error) {
      trackEvent('join_mission_submit_failed', {
        selected_mission_id: data.missionId || 'none',
      });
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Application Submitted!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your interest in joining Saguaro Strikers. We've sent confirmation emails to both the student and parent email addresses provided.
            </p>
            <p className="text-gray-600 mb-8">
              Our team will review your application and get back to you within 3-5 business days.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/" className="btn-primary">
                Back to Home
              </a>
              <button
                onClick={() => setIsSuccess(false)}
                className="btn-outline"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="h-10 w-10 text-primary-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Join a Mission</h1>
          </div>
          <p className="text-lg text-gray-600">
            Ready to get on board? Fill out the form below to apply.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Student Details */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Student's Details
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              (Do not use parent details here)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('studentFirstName', { required: 'First name is required' })}
                  className="input"
                />
                {errors.studentFirstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentFirstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name
                </label>
                <input {...register('studentMiddleName')} className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('studentLastName', { required: 'Last name is required' })}
                  className="input"
                />
                {errors.studentLastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentLastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('studentDob', { required: 'Date of birth is required' })}
                  className="input"
                />
                {errors.studentDob && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentDob.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('schoolName', { required: 'School name is required' })}
                  className="input"
                />
                {errors.schoolName && (
                  <p className="text-red-500 text-sm mt-1">{errors.schoolName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('grade', { required: 'Grade is required' })}
                  className="input"
                >
                  <option value="">Select Grade</option>
                  {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                    <option key={grade} value={grade}>{grade}th Grade</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {errors.grade && (
                  <p className="text-red-500 text-sm mt-1">{errors.grade.message}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('studentAddressLine1', { required: 'Address is required' })}
                className="input"
              />
              {errors.studentAddressLine1 && (
                <p className="text-red-500 text-sm mt-1">{errors.studentAddressLine1.message}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
              </label>
              <input {...register('studentAddressLine2')} className="input" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('studentCity', { required: 'City is required' })}
                  className="input"
                />
                {errors.studentCity && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentCity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('studentState', { required: 'State is required' })}
                  className="input"
                  maxLength={2}
                  placeholder="AZ"
                />
                {errors.studentState && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentState.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('studentZip', { required: 'Zip code is required' })}
                  className="input"
                  maxLength={10}
                />
                {errors.studentZip && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentZip.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register('studentEmail', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                  })}
                  className="input"
                />
                {errors.studentEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input {...register('studentPhone')} className="input" type="tel" />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slack ID (optional)
              </label>
              <input {...register('studentSlack')} className="input" />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mission Interested In <span className="text-red-500">*</span>
              </label>
              {isMissionLocked ? (
                <>
                  {/* Hidden: disabled selects are not submitted; keep missionId in form data */}
                  <input
                    type="hidden"
                    key={lockedMissionId || lockedMissionTitle}
                    {...register('missionId', { required: isOutreachJoinFlow ? false : 'Mission is required' })}
                    defaultValue={lockedMissionId}
                  />
                  <div
                    className="input bg-gray-100 text-gray-900 border-gray-200 cursor-default select-none"
                    aria-readonly="true"
                  >
                    {lockedMissionTitle || 'Loading mission…'}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    This selection was pre-filled and cannot be changed here.
                  </p>
                  {missionsLoaded && !lockedMissionId && (
                    <p className="text-sm text-amber-700 mt-1">
                      No open mission currently matches this event title. Please go to{' '}
                      <a href="/join-mission" className="underline font-medium">
                        Join a Mission
                      </a>
                      {' '}to choose a mission manually.
                    </p>
                  )}
                </>
              ) : (
                <select
                  {...register('missionId', { required: isOutreachJoinFlow ? false : 'Please select a mission' })}
                  className="input"
                >
                  <option value="">Select a Mission</option>
                  {missions.map(mission => (
                    <option key={mission.missionId} value={mission.missionId}>
                      {mission.title}
                    </option>
                  ))}
                </select>
              )}
              {errors.missionId && (
                <p className="text-red-500 text-sm mt-1">{errors.missionId.message}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you fit for this mission? <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('fitReason', { required: 'Please explain why you are interested' })}
                rows={4}
                className="input"
                placeholder="Tell us about your interest in rocketry, relevant skills, and why you want to join this mission..."
              />
              {errors.fitReason && (
                <p className="text-red-500 text-sm mt-1">{errors.fitReason.message}</p>
              )}
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student's Electronic Signature <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-2">Type your full name to sign electronically</p>
              <input
                {...register('studentSignature', { required: 'Signature is required' })}
                className="input"
                placeholder="Type your full name"
              />
              {errors.studentSignature && (
                <p className="text-red-500 text-sm mt-1">{errors.studentSignature.message}</p>
              )}
            </div>
          </div>

          {/* Parent Details */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Parent/Guardian Details
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Please provide parent or guardian contact information
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('parentFirstName', { required: 'Parent first name is required' })}
                  className="input"
                />
                {errors.parentFirstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentFirstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name
                </label>
                <input {...register('parentMiddleName')} className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('parentLastName', { required: 'Parent last name is required' })}
                  className="input"
                />
                {errors.parentLastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentLastName.message}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('parentAddressLine1', { required: 'Parent address is required' })}
                className="input"
              />
              {errors.parentAddressLine1 && (
                <p className="text-red-500 text-sm mt-1">{errors.parentAddressLine1.message}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
              </label>
              <input {...register('parentAddressLine2')} className="input" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('parentCity', { required: 'Parent city is required' })}
                  className="input"
                />
                {errors.parentCity && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentCity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('parentState', { required: 'Parent state is required' })}
                  className="input"
                  maxLength={2}
                  placeholder="AZ"
                />
                {errors.parentState && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentState.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('parentZip', { required: 'Parent zip code is required' })}
                  className="input"
                  maxLength={10}
                />
                {errors.parentZip && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentZip.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register('parentEmail', {
                    required: 'Parent email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                  })}
                  className="input"
                />
                {errors.parentEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('parentPhone', { required: 'Parent phone is required' })}
                  className="input"
                  type="tel"
                />
                {errors.parentPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentPhone.message}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alternate Email (optional)
              </label>
              <input
                type="email"
                {...register('parentAlternateEmail', {
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                })}
                className="input"
              />
              {errors.parentAlternateEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.parentAlternateEmail.message}</p>
              )}
            </div>
          </div>

          {/* Agreements */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Agreements & Consent
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register('agreementFinancial', { required: 'Financial agreement is required' })}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> {agreements.agreementFinancial}
                </label>
              </div>
              {errors.agreementFinancial && (
                <p className="text-red-500 text-sm ml-7">{errors.agreementFinancial.message}</p>
              )}

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register('agreementPhotograph', { required: 'Photograph agreement is required' })}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> {agreements.agreementPhotograph}
                </label>
              </div>
              {errors.agreementPhotograph && (
                <p className="text-red-500 text-sm ml-7">{errors.agreementPhotograph.message}</p>
              )}

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register('agreementLiability', { required: 'Liability agreement is required' })}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> {agreements.agreementLiability}
                </label>
              </div>
              {errors.agreementLiability && (
                <p className="text-red-500 text-sm ml-7">{errors.agreementLiability.message}</p>
              )}
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent/Guardian's Electronic Signature <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-2">Type your full name to sign electronically</p>
              <input
                {...register('parentSignature', { required: 'Parent signature is required' })}
                className="input"
                placeholder="Type your full name"
              />
              {errors.parentSignature && (
                <p className="text-red-500 text-sm mt-1">{errors.parentSignature.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2 px-8 py-3"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
