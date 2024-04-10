import React, { useState } from 'react';
import { ListOptionModalProps, Project } from './interfaces/interfaces';
import { supabase } from './supabaseClient';

const ListOptionModal: React.FC<ListOptionModalProps> = ({ isOpen, onClose, project }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      if (!project) {
        console.error('Project is null.');
        return;
      }

      setIsLoading(true);

      const { data, error } = await supabase
        .from('project_list')
        .update({
          monday_availability: project.monday_availability,
          tuesday_availability: project.tuesday_availability,
          wednesday_availability: project.wednesday_availability,
          thursday_availability: project.thursday_availability,
          friday_availability: project.friday_availability,
          saturday_availability: project.saturday_availability,
          sunday_availability: project.sunday_availability,
          start_availability: project.start_availability,
          end_availability: project.end_availability,
          allow_overlapping: project.allowOverlapping,
        }).eq('service_id', project.id);

      if (error) {
        console.error('Error updating project:', error.message);
      } else {
        console.log('Project updated successfully:', data);
        // Optionally, you can perform any additional actions after updating the project
      }
    } catch {
      console.error('Error updating project:');
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  if (!isOpen || !project) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
          zIndex: 999, // Higher z-index than the modal
        }}
        onClick={onClose} // Close modal when clicking on the backdrop
      />
      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        color: 'black',
        padding: '20px',
        zIndex: 1000,
      }}>
        <h3>Options for {project.name}</h3>
        <div>
          {/* Render checkboxes for each day of the week */}
          <label>
            <input
              type="checkbox"
              checked={project.monday_availability}
              onChange={() => {
                // Toggle Monday availability
                project.monday_availability = !project.monday_availability;
              }}
            />
            Monday Availability
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={project.tuesday_availability}
              onChange={() => {
                // Toggle Tuesday availability
                project.tuesday_availability = !project.tuesday_availability;
              }}
            />
            Tuesday Availability
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={project.wednesday_availability}
              onChange={() => {
                // Toggle Wednesday availability
                project.wednesday_availability = !project.wednesday_availability;
              }}
            />
            Wednesday Availability
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={project.thursday_availability}
              onChange={() => {
                // Toggle Thursday availability
                project.thursday_availability = !project.thursday_availability;
              }}
            />
            Thursday Availability
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={project.friday_availability}
              onChange={() => {
                // Toggle Friday availability
                project.friday_availability = !project.friday_availability;
              }}
            />
            Friday Availability
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={project.saturday_availability}
              onChange={() => {
                // Toggle Saturday availability
                project.saturday_availability = !project.saturday_availability;
              }}
            />
            Saturday Availability
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={project.sunday_availability}
              onChange={() => {
                // Toggle Sunday availability
                project.sunday_availability = !project.sunday_availability;
              }}
            />
            Sunday Availability
          </label>
        </div>
        {/* Input fields for start and end time */}
        <div>
          <label>Start Time:</label>
          <input
            type="time"
            value={project.start_availability}
            onChange={(e) => {
              // Update start time
              project.start_availability = e.target.value;
            }}
          />
        </div>
        <div>
          <label>End Time:</label>
          <input
            type="time"
            value={project.end_availability}
            onChange={(e) => {
              // Update end time
              project.end_availability = e.target.value;
            }}
          />
        </div>
        {/* Checkbox for allowing overlapping events */}
        <div>
          <label>
            <input
              type="checkbox"
              checked={project.allowOverlapping}
              onChange={() => {
                // Toggle allow overlapping
                project.allowOverlapping = !project.allowOverlapping;
              }}
            />
            Allow Overlapping Events
          </label>
        </div>
        <div style={{ marginTop: '10px' }}>
        <button
          onClick={handleSave}
          disabled={isLoading}
          style={{ marginRight: '10px' }} // Add margin to create space
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
};

export default ListOptionModal;
