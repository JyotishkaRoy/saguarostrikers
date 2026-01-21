import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { Send, CheckCircle } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
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

export default function JoinMission() {
  const [searchParams] = useSearchParams();
  const preselectedMissionId = searchParams.get('missionId');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<JoinMissionFormData>();

  useEffect(() => {
    fetchActiveMissions();
  }, []);

  useEffect(() => {
    // Pre-select mission if missionId is provided in URL
    if (preselectedMissionId && missions.length > 0) {
      setValue('missionId', preselectedMissionId);
    }
  }, [preselectedMissionId, missions, setValue]);

  const fetchActiveMissions = async () => {
    try {
      const response = await api.get<Mission[]>('/public/missions');
      if (response.success && response.data) {
        setMissions(response.data.filter(m => m.status === 'published'));
      }
    } catch (error) {
      console.error('Failed to fetch missions:', error);
    }
  };

  const onSubmit = async (data: JoinMissionFormData) => {
    setIsSubmitting(true);
    try {
      // Add signature dates
      data.studentSignatureDate = new Date().toISOString();
      data.parentSignatureDate = new Date().toISOString();

      const response = await api.post('/public/join-mission', data);
      
      if (response.success) {
        toast.success('Application submitted successfully! Check your email for confirmation.');
        setIsSuccess(true);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
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
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join a Mission
          </h1>
          <p className="text-xl text-gray-600">
            Ready to launch your rocketry journey? Fill out the form below to apply.
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
              <select
                {...register('missionId', { required: 'Please select a mission' })}
                className={`input ${preselectedMissionId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={!!preselectedMissionId}
              >
                <option value="">Select a Mission</option>
                {missions.map(mission => (
                  <option key={mission.missionId} value={mission.missionId}>
                    {mission.title}
                  </option>
                ))}
              </select>
              {preselectedMissionId && (
                <p className="text-sm text-primary-600 mt-1">
                  ✓ Mission pre-selected from the mission page
                </p>
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

          {/* Parent Details - Will create in next part */}
          {/* (Continuing in next response due to length) */}

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
