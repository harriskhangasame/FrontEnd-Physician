import React, { useState } from 'react';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';
import { BsFileEarmarkArrowUp } from 'react-icons/bs';
import { useLocalContext } from '../context/context';
import db, { storage } from '../lib/firebase';
import {ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase Storage
import { doc, setDoc } from 'firebase/firestore';

const Chat = ({ isSidebarOpen }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputText, setInputText] = useState('');
  const [selectedButton, setSelectedButton] = useState('Summary 1');
  const [uploading, setUploading] = useState(false);
  const [rewrittenPdfUrl, setRewrittenPdfUrl] = useState(null); // New state to store rewritten PDF URL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useLocalContext();

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleButtonClick = (buttonId) => {
    setSelectedButton(buttonId);
  };

  const handleSendClick = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    let prompt = '';
    if (selectedButton === 'Summary 1') {
      prompt = inputText || 'Summarize the following patient information in the given form and do not miss any medicatioin,try to recheck before writing the summary:Name:Date of Birth:Gender:Medicare/Insurance ID:Primary Care Physician:Emergency Contact: (Name and Phone Number)Hospital Discharge Information.Hospital Name:Date of Admission:Date of Discharge:Reason for Admission:Discharge Diagnosis:Primary Diagnosis: (ICD-10 Code)Secondary Diagnoses: (ICD-10 Codes)Discharge Summary:Brief overview of hospital stay, treatments received, and condition at discharge.Medical History.Chronic Conditions: (List any ongoing conditions such as diabetes, hypertension, etc.)Surgical History: (List past surgeries with dates)Allergies: (List any known allergies, especially to medications)Medications.Current Medications:Medication Name | Dosage | Frequency | Route Example: Metformin | 500 mg | Twice daily | Oral Changes in Medications:Note any changes made during the hospital stay.Treatment and Procedures.Key Procedures During Hospital Stay:List significant procedures and outcomes (e.g., surgeries, catheter placements).Wound Care:Description of wounds or incisions, if applicable.Functional Status.Mobility: (e.g., independent, requires assistance with walking)Activities of Daily Living (ADLs):Bathing, dressing, feeding, etc., and level of assistance required.Cognitive Function:Orientation, memory, and ability to follow instructions.Vital Signs at Discharge.Temperature:Pulse:Respiration Rate:Blood Pressure:Oxygen Saturation:Lab and Diagnostic Test Results.Significant Lab Results:Include abnormal results and any trends.Imaging/Diagnostics:Summarize key findings from X-rays, MRIs, etc.Progress notes from the clinicians.Discharge Instructions and Follow-Up Care Instructions:Key instructions given to the patient and family for post-discharge care.Dietary Restrictions:Special diet requirements, if any.Activity Restrictions:Limitations on physical activity, if applicable.Follow-Up Appointments:Schedule and location of upcoming appointments with specialists or primary care.Clearly define short-term and long-term goals to track progress in OASIS submissions (e.g., wound healing, improving mobility, medication adherence).OASIS and PCR Submissions.OASIS (Outcome and Assessment Information Set):Highlight areas critical for the OASIS submission, particularly focusing on ADLs, mobility, wound care, and cognitive function.Include detailed clinical assessment findings that will inform accurate OASIS scoring (e.g., ability to bathe, walk, cognitive status).PCR (Pre-Claim Review) Documentation:Ensure all services and procedures mentioned align with the plan of care and are supported by clear, justifiable documentation to meet Medicare and insurance requirements.Include documentation of care coordination and rationale for skilled nursing visits or therapies.Compliance Considerations:Ensure that all interventions (e.g., wound care, medication administration) are documented clearly to meet billing requirements for Medicare and private insurance reimbursement.do not miss any crucial information such as discharge summary, vitals such as temperature pulse etc';
    } else if (selectedButton === 'Summary 2') {
      prompt = inputText || "Write a detailed summary for the given information,with the following components:Comprehensive Review of the Case.Clinical Problem Representation.Most Likely Differential Diagnosis with detail about every point .Expanded Differential Diagnosis.Can't Miss Differential Diagnosis with detail about every point .Also Devise a detailednon medical plan of care for the patient according to patient need.";
    }

    formData.append('prompt', prompt);

    try {
      setUploading(true);
      console.log("button Clicked");
      const response = await fetch('https://1488-35-239-233-182.ngrok-free.app/process_pdf', {
        method: 'POST',
        body: formData,
      });
      let pdfUrl;
      if (response.ok) {
        const blob = await response.blob();
        pdfUrl = URL.createObjectURL(blob);
        setRewrittenPdfUrl(pdfUrl); // Set the URL of the rewritten PDF to the state
        console.log("response sent");
      } else {
        console.error('Error from API');
      }
      const storageRef = ref(storage, `${user.email}/${selectedFile.name}/${selectedButton}`);

      try {
        // Upload the file
        const snapshot = await uploadBytes(storageRef, selectedFile);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(selectedFile);
        // Save details in Firestore
        const fileDocRef = doc(db, 'uploads', `${user.email}/${selectedFile.name}/${selectedButton}`);
        console.log("check 2");
        await setDoc(fileDocRef, {
          userEmail: user.email,
          fileName: selectedFile.name,
          responsePdf:pdfUrl,
          summaryType: selectedButton,
          filePath: `${user.email}/${selectedFile.name}/${selectedButton}`,
          downloadURL: downloadURL,
          uploadedAt: new Date(),
        });
        console.log("check 3");
        // alert('File uploaded successfully!');
      } catch (error) {
        console.error("Error uploading file:", error);
        alert('Failed to upload the file.');
      } finally {
        setUploading(false);
      }
    } catch (error) {
      console.error('Error occurred while sending request:', error);
    } finally {
      setUploading(false);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 shadow-lg rounded-md sm:pt-[18vh]">
      {/* Content Area (scrollable) */}
      <div className="flex-grow overflow-y-auto p-6 pb-[30vh]">
        <div className="mb-2">
          <p className="font-semibold text-center text-xl mb-4">Input a Patient Summary</p>
          <p className="text-justify sm:w-[64vw] mx-auto mb-4">
            Include age, sex, relevant past medical history, medications, presenting symptoms, associated symptoms, etc.
          </p>
        </div>

        {/* File Upload and Input */}
        {selectedFile && (
          <div className="flex items-center justify-between border border-gray-300 bg-gray-100 p-3 rounded-md mb-4">
            <span className="text-gray-800 font-semibold">{selectedFile.name}</span>
            <FaTimes className="text-gray-500 cursor-pointer" onClick={handleRemoveFile} />
          </div>
        )}

        {/* PDF Viewer Block */}
        {rewrittenPdfUrl && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Rewritten PDF:</p>
            <div className="border border-gray-300 p-4 bg-white rounded-md mb-4" style={{ height: '500px', overflowY: 'auto' }}>
              <iframe src={rewrittenPdfUrl} className="w-full h-full" title="Rewritten PDF" />
            </div>
            <a href={rewrittenPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              Click here to download the PDF
            </a>
          </div>
        )}

        {/* Disclaimer
        <div className="mt-4">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-blue-500 text-3xl" />
            <div>
              <p className="font-semibold mb-2">Physician preferred Health AI Clinical Decision Support Platform Terms of Use</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Fixed Input and Action Area */}
      <div className={`bg-white shadow p-4 border-t fixed right-0 bottom-0 ${isSidebarOpen ? 'left-[16vw]' : 'left-0'} transition-all`}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md border-gray-300 flex-grow h-full">
              <label className="flex items-center cursor-pointer p-2">
                <BsFileEarmarkArrowUp className="text-gray-400 text-xl" />
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf"
                />
              </label>
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type a message or upload a file"
                className="flex-grow p-2 outline-none h-full"
              />
            </div>
            <button
              onClick={handleSendClick}
              className="bg-[#015BA3] text-white font-semibold px-4 py-2 rounded-md h-full"
              disabled={!selectedFile || uploading||!user}
            >
              {uploading ? 'Uploading...' : 'Send'}
            </button>
          </div>

          {/* Action Buttons for Summary Selection */}
          <div className="grid grid-cols-2 gap-2">
            {['Summary 1', 'Summary 2'].map((text, index) => (
              <button
                key={index}
                onClick={() => handleButtonClick(text)}
                className={`p-2 border rounded-md ${selectedButton === text
                  ? 'bg-[#015BA3] text-white border-[#015BA3]'
                  : 'bg-white text-[#015BA3] border-[#015BA3]'
                  }`}
              >
                {text}
              </button>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-2 text-center">
            <button onClick={toggleModal} className="text-blue-500 underline">
              Disclaimer
            </button>
          </p>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-md w-[90vw] md:w-[40vw]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Disclaimer</h2>
              <FaTimes className="cursor-pointer text-gray-500" onClick={toggleModal} />
            </div>
            {/* Add a fixed height and make the content scrollable */}
            <div className="text-sm text-gray-700 h-64 overflow-y-auto">
              <p>
                Protego Health AI Clinical Decision Support Platform Terms of Use

                Purpose and Functionality
                The Protego Health AI Clinical Decision Support (CDS) platform is specifically designed to augment the clinical decision-making processes of healthcare professionals. The platform's functionalities include the generation of preliminary drafts for differential diagnoses, clinical assessments, treatment plans, and responses to clinical reference inquiries.

                Recommendation and Review
                All outputs generated by the AI CDS serve as preliminary recommendations intended for independent review by the clinician user. These outputs are to be utilized as draft recommendations, requiring detailed review and validation by the clinician. The AI CDS platform's core features are intended solely as a supplementary tool to support clinical reasoning and must not replace or override the professional judgment of clinicians.

                Platform Development and Limitations
                Protego Health is committed to the continuous development of the AI CDS platform while recognizing and addressing its current limitations. The mission is to empower clinicians with a leading-edge AI CDS platform and improve patient outcomes globally.

                Bias and Equity Considerations
                Large language models, such as those utilized in the AI CDS platform, inherently possess limitations, including the potential to perpetuate biases derived from pre-training, fine-tuning, and user input. Protego Health has made extensive efforts to mitigate the perpetuation of harmful biases. As part of our commitment to safety, equity, and alignment in the deployment of AI CDS globally, users are advised to omit elements of clinical scenarios related to race, ethnicity, sexual orientation, gender, socio-economic status, disabilities, age, geographical location, and language or cultural background when utilizing the AI CDS. The prevention of bias perpetuation and the promotion of health equity are fundamental components of Protego Health's mission.

                Restrictions on Use
                The Protego Health AI CDS platform is explicitly not intended for use by patients. Users are strictly prohibited from employing this platform for personal health advice or as a substitute for professional medical consultation. The platform provides recommendations intended to assist clinicians in their clinical decision-making processes. AI-generated responses necessitate the expertise of a qualified clinician for accurate interpretation, as they often encompass a broad spectrum of potential diagnoses, diagnostic options, and therapeutic considerations within the context of probabilistic clinical reasoning.
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={toggleModal} className="bg-[#015BA3] text-white px-4 py-2 rounded-md">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Chat;