let activeProject = "System";

module.exports = {
  setProject: (name) => {
    activeProject = name;
    console.log("📌 Active Project switched to:", name);
  },
  getProject: () => activeProject
};
