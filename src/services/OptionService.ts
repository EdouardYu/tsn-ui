import axios from "axios";

const OptionService = {
  getOptions: async (filters: string[]) => {
    const filterParam = filters.join(",");
    const response = await axios.get(
      `http://localhost:8080/api/options?filters=${filterParam}`
    );
    return response;
  },
};

export default OptionService;
