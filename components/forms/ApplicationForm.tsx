"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileCheck,
  X,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Award,
} from "lucide-react";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { availableCourses, qualificationOptions } from "@/lib/content";
import { formatBytes } from "@/lib/utils";
import { submitApplicationAction } from "@/app/actions/application-actions";

import { CmsCourse } from "@/types";

const steps = [
  { id: 1, title: "Personal Details", subtitle: "Name, Age & Address" },
  { id: 2, title: "Course & Qualification", subtitle: "Select Program" },
  { id: 3, title: "FAYDA ID & Signature", subtitle: "Official Verification" },
];

interface ApplicationFormProps {
  dynamicCourses?: CmsCourse[];
}

export function ApplicationForm({ dynamicCourses }: ApplicationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeCourseTitles = dynamicCourses && dynamicCourses.length > 0
    ? dynamicCourses.map(c => c.title)
    : availableCourses;

  // Form fields state based on client questionnaire
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    fullAddress: "",
    phone: "",
    email: "",
    qualification: qualificationOptions[3], // Bachelor's Degree default
    courseApplied: activeCourseTitles[0] || "Artificial Intelligence (AI)",
    signature: "",
    place: "Addis Ababa",
    submissionDate: new Date().toISOString().split("T")[0],
    captchaInput: "",
  });

  // Captcha state
  const [captchaCode, setCaptchaCode] = useState("AE79X");
  const [captchaError, setCaptchaError] = useState(false);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaError(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // FAYDA ID file state
  const [faydaFile, setFaydaFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage(null);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setFileError(null);
    const validExtensions = [".pdf", ".png", ".jpg", ".jpeg"];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(ext)) {
      setFileError("Only PDF, PNG or JPG files are allowed for your Official FAYDA ID.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError("Document size must be less than 10MB.");
      return;
    }
    setFaydaFile(selectedFile);
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim()) return "Please enter your First Name.";
    if (!formData.lastName.trim()) return "Please enter your Last / Family Name.";
    if (!formData.age || parseInt(formData.age, 10) < 16 || parseInt(formData.age, 10) > 99) {
      return "Please enter a valid age (16+).";
    }
    if (!formData.fullAddress.trim()) return "Please enter your Full Residential Address in Ethiopia.";
    if (!formData.phone.trim()) return "Please enter your contact Phone number.";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      return "Please enter a valid Email address.";
    }
    return null;
  };

  const validateStep2 = () => {
    if (!formData.qualification) return "Please state your College or University Qualification.";
    if (!formData.courseApplied) return "Please select the Course applied for.";
    return null;
  };

  const nextStep = () => {
    if (currentStep === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMessage(err);
        return;
      }
      setErrorMessage(null);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const err = validateStep2();
      if (err) {
        setErrorMessage(err);
        return;
      }
      setErrorMessage(null);
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!faydaFile) {
      setFileError("Please upload your Official ID (FAYDA).");
      return;
    }

    if (!formData.signature.trim()) {
      setErrorMessage("Please enter your Applicant Signature declaration.");
      return;
    }

    if (!formData.place.trim()) {
      setErrorMessage("Please enter the Place of application (e.g. Addis Ababa).");
      return;
    }

    // Verify Captcha
    if (formData.captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setCaptchaError(true);
      setErrorMessage("Incorrect verification code. Please check and re-enter.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = new FormData();
    payload.append("firstName", formData.firstName);
    payload.append("middleName", formData.middleName);
    payload.append("lastName", formData.lastName);
    payload.append("age", formData.age);
    payload.append("fullAddress", formData.fullAddress);
    payload.append("phone", formData.phone);
    payload.append("email", formData.email);
    payload.append("qualification", formData.qualification);
    payload.append("courseApplied", formData.courseApplied);
    payload.append("signature", formData.signature);
    payload.append("place", formData.place);
    payload.append("submissionDate", formData.submissionDate);
    payload.append("faydaId", faydaFile);

    const result = await submitApplicationAction(payload);
    setIsSubmitting(false);

    if (result.success && result.applicationId) {
      router.push(`/payment-instructions?ref=${result.applicationId}`);
    } else {
      setErrorMessage(result.error || "Failed to submit application. Please check your data and retry.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <ProgressSteps steps={steps} currentStep={currentStep} />

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center text-rose-700 text-xs">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Card className="mt-6 bg-white border-slate-200 shadow-md">
        <CardContent className="p-8 sm:p-10">
          <AnimatePresence mode="wait">
            {/* STEP 1: Personal Details */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Please provide your legal name, age, Ethiopian address, and direct contact info.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      First Name <span className="text-blue-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="e.g. Dawit"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Middle Name (Father)
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleInputChange}
                      placeholder="e.g. Haile"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Last Name (Grandfather) <span className="text-blue-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="e.g. Tadesse"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Age <span className="text-blue-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="e.g. 24"
                      min={16}
                      max={99}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Phone Number <span className="text-blue-600">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+251 91 123 4567"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Email Address <span className="text-blue-600">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="applicant@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full Address (City, Sub-City / Zone, Woreda / Kebele) <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullAddress"
                    value={formData.fullAddress}
                    onChange={handleInputChange}
                    placeholder="e.g. House 412, Woreda 03, Bole Sub-City, Addis Ababa, Ethiopia"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: Course & Qualification */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Course Applied For & Academic Background</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select your target learning pathway through University in New York / Skillsoft Percipio.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    College or University Qualification <span className="text-blue-600">*</span>
                  </label>
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                  >
                    {qualificationOptions.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Course Applied For <span className="text-blue-600">*</span>
                  </label>
                  <select
                    name="courseApplied"
                    value={formData.courseApplied}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-sm font-semibold shadow-sm"
                  >
                    {dynamicCourses && dynamicCourses.length > 0 ? (
                      <>
                        <optgroup label="Job-Ready Global Learning Programs (24 Weeks)">
                          {dynamicCourses
                            .filter((c) => c.category === "job-ready" || c.category === "tech" || c.category === "business")
                            .map((c) => (
                              <option key={c.id} value={c.title}>
                                {c.title} ({c.duration})
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="Postgraduate Diploma (PGD) Programs (12 Months)">
                          {dynamicCourses
                            .filter((c) => c.category === "pgd")
                            .map((c) => (
                              <option key={c.id} value={c.title}>
                                {c.title} ({c.duration})
                              </option>
                            ))}
                        </optgroup>
                      </>
                    ) : (
                      <>
                        <optgroup label="Job-Ready Global Learning Programs (24 Weeks)">
                          {availableCourses
                            .filter((c) => c.startsWith("Job-Ready"))
                            .map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="Postgraduate Diploma (PGD) Programs (Coming Soon)">
                          {availableCourses
                            .filter((c) => c.startsWith("PGD"))
                            .map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                        </optgroup>
                      </>
                    )}
                  </select>
                </div>

                {/* Subsidized course note */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start space-x-3 text-xs text-blue-900">
                  <Award className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">
                      Subsidized Access for Ethiopian Learners
                    </span>
                    <p className="leading-relaxed text-blue-800">
                      Learners who maintain a GPA of 3.6 or higher (90%+) will be eligible for an official Merit
                      Badge. High achievers reaching 95%+ are awarded the distinguished A. Medallion of Merit.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: FAYDA ID, Signature & Captcha */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Official ID & Verification Declaration</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload your official Ethiopian National ID (FAYDA), declare signature, and verify code.
                  </p>
                </div>

                {/* FAYDA ID Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Upload your Official ID (FAYDA) <span className="text-blue-600">*</span>
                  </label>

                  {fileError && (
                    <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center text-rose-700 text-xs">
                      <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-600" />
                      <span>{fileError}</span>
                    </div>
                  )}

                  {!faydaFile ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 bg-blue-50/40 hover:bg-blue-50/70 group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-105 transition-all duration-200 mb-3">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">Click or drag & drop FAYDA ID here</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Ethiopian National ID (FAYDA) Digital Slip or Card (PDF, PNG, JPG up to 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{faydaFile.name}</p>
                          <p className="text-[11px] text-slate-500">{formatBytes(faydaFile.size)} • Official ID</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFaydaFile(null)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Signature, Place, Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Signature of Applicant <span className="text-blue-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="signature"
                      value={formData.signature}
                      onChange={handleInputChange}
                      placeholder="Type your full legal name as signature"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm font-serif italic shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Place <span className="text-blue-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="place"
                      value={formData.place}
                      onChange={handleInputChange}
                      placeholder="e.g. Addis Ababa"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      name="submissionDate"
                      value={formData.submissionDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Captcha Verification */}
                <div className="pt-4 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Enter Verification Code <span className="text-blue-600">*</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Visual Captcha Image Box */}
                    <div className="flex items-center space-x-3">
                      <div className="px-6 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-800 text-xl font-black font-mono tracking-widest text-sky-400 select-none shadow-inner">
                        <span className="inline-block transform -rotate-3">{captchaCode[0]}</span>
                        <span className="inline-block transform rotate-6">{captchaCode[1]}</span>
                        <span className="inline-block transform -rotate-6">{captchaCode[2]}</span>
                        <span className="inline-block transform rotate-3">{captchaCode[3]}</span>
                        <span className="inline-block transform -rotate-2">{captchaCode[4]}</span>
                      </div>

                      <button
                        type="button"
                        onClick={generateCaptcha}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 py-1 font-semibold"
                        title="Click to refresh image code"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="underline">Can&apos;t read the image? click here to refresh</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      name="captchaInput"
                      value={formData.captchaInput}
                      onChange={handleInputChange}
                      maxLength={5}
                      placeholder="Enter 5-digit code"
                      className={`w-full sm:w-44 px-4 py-2.5 rounded-xl bg-white border uppercase font-mono tracking-wider focus:outline-none text-sm shadow-sm ${
                        captchaError ? "border-rose-500 focus:border-rose-500" : "border-slate-300 focus:border-blue-600"
                      }`}
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Actions */}
          <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep} disabled={isSubmitting}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next Section
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} isLoading={isSubmitting} className="shadow-lg shadow-blue-600/25">
                Submit Application Dossier
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
