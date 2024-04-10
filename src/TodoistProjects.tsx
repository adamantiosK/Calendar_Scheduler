import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListOptionModal from './ListOptionModalComponent';
import { supabase } from './supabaseClient';
import { TodoistProjectsProps, Project} from './interfaces/interfaces';
import calendarIcon from './assets/calendar-icon.png'


const TodoistProjects: React.FC<TodoistProjectsProps> = ({ apiToken, user_id }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!apiToken) {
      console.error('API token is required');
      return;
    }

    // we need to fetch stored projects and with those ids. and then map the isSelected to true with the ones found


    axios.get('https://api.todoist.com/rest/v2/projects', {
      headers: { Authorization: `Bearer ${apiToken}` }
    })
      .then(async response => {
        const formattedProjects = response.data.map((project: any) => ({
          ...project,
          isSelected: false // Initialize all projects as not selected
        }));

        const ids = formattedProjects.map((project: Project) => project.id);

        let { data, error, status } = await supabase
          .from('project_list')
          .select('*')
          .in('service_id', ids);

        if (error) {
          throw error;
        }

        if (data !== null) {
          data.forEach(item => {
            const index = formattedProjects.findIndex((project: Project) => project.id === item.service_id);
            if (index !== -1) {
              // formattedProjects[index].isSelected = true;
              formattedProjects[index] = {
                ...formattedProjects[index], // Spread existing properties
                isSelected: true,
                monday_avalability: item.monday_availability,
                tuesday_availability: item.tuesday_availability,
                wednesday_availability: item.wednesday_availability,
                thursday_availability: item.thursday_availability,
                friday_availability: item.friday_availability,
                saturday_availability: item.saturday_availability,
                sunday_availability: item.sunday_availability,
                start_availability: item.start_availability,
                end_availability: item.end_availability,
                allowOverlapping: item.allowOverlapping
              };
            }
          });
        }

        setProjects(formattedProjects);
      })
      .catch(error => console.error("Error fetching Todoist projects:", error));
  }, [apiToken]);

  const handleCheckboxChange = (id: number, isSelected: boolean) => {
    setProjects(projects.map(project =>
      project.id === id ? { ...project, isSelected: isSelected } : project
    ));

    if(isSelected){
      const projectToSave = projects.find((project: Project) => project.id === id);
      if(projectToSave)
        saveNewListToDB(projectToSave)
    }else{
      deleteListFromDB(id)
    }
  };

  const saveNewListToDB = async (project: Project) => {
    const newData = {
      user_id: user_id,
      service_id: project.id, 
      list_name: project.name, 
    };

    // Insert data into the 'project_list' table
    const { data: insertedData, error } = await supabase
      .from('project_list')
      .insert([newData]);

    if (error) {
      console.error('Error inserting data:', error);
    } else {
      console.log('Data inserted successfully:', insertedData);
    }
  };

  const deleteListFromDB = async (id: number) => {
    const { data, error } = await supabase
      .from('project_list')
      .delete()
      .eq('service_id', id);

    if (error) {
      console.error('Error deleting data:', error);
    } else {
      console.log('Data deleted successfully:', data);
    }
  };

  const handleOpenOptions = (project: Project) => {
    if (project.isSelected) {
      setSelectedProject(project);
    }
  };

  const openCalendarLink = () => {
      window.open("https://www.geeksforgeeks.org", '_blank');  
  };

  return (
    <div>
      <h2>Todoist Projects</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {projects.map((project) => (
          <li key={project.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={project.isSelected}
              onChange={(e) => handleCheckboxChange(project.id, e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            {project.name}
            <button
              onClick={() => handleOpenOptions(project)}
              disabled={!project.isSelected}
              style={{ marginLeft: 'auto' }}
            >
              Open Options
            </button>
            <button
              onClick={openCalendarLink}
              disabled={!project.isSelected}
              style={{
                marginLeft: '5px'
              }}
            >
              <img src={calendarIcon} alt="Calendar Icon" style={{ width: '18px', height: '16px' }} />
            </button>
          </li>
        ))}
      </ul>
      <ListOptionModal
        isOpen={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
      />
    </div>
  );
};

export default TodoistProjects;
